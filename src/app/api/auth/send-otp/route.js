// Feature Domain: Authentication & Access Control

// sends a 6-digit verification code to the student

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerification from "@/models/EmailVerification";
import { getStudentEmailFormatMessage, isValidStudentEmail } from "@/lib/validations";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

function getEmailTransportConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from,
  };
}

async function sendOtpEmail({ to, otp }) {
  const config = getEmailTransportConfig();

  if (!config) {
    throw new Error("Email service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Club Sphear - Email Verification Code",
    text: `Your Club Sphear verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 8px;">Verify Your Email</h2>
        <p style="margin: 0 0 12px;">Use this OTP to complete your Club Sphear registration:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 0 0 12px;">${otp}</p>
        <p style="margin: 0 0 12px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
}

// api route to handle sending the code
export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validate email format
    if (!email || !isValidStudentEmail(email)) {
      return NextResponse.json(
        { success: false, message: getStudentEmailFormatMessage() },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists (email already registered)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered. Please login or use a different email." },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const normalizedEmail = email.toLowerCase().trim();

    await sendOtpEmail({ to: normalizedEmail, otp });

    // Store/update OTP in database only after successful send
    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp,
        verified: false,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent! Check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
