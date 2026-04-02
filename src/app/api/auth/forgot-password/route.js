// Feature Domain: Authentication & Access Control

// sends a 6-digit password reset code to the user's email

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { isValidStudentEmail } from "@/lib/validations";

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

  return { host, port, secure, auth: { user, pass }, from };
}

async function sendResetOtpEmail({ to, otp }) {
  const config = getEmailTransportConfig();

  if (!config) {
    throw new Error("Email service is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Club Sphear - Password Reset Code",
    text: `Your Club Sphear password reset code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 8px;">Reset Your Password</h2>
        <p style="margin: 0 0 12px;">Use this code to reset your Club Sphear password:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 0 0 12px;">${otp}</p>
        <p style="margin: 0 0 12px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }
    if (!isValidStudentEmail(email.trim())) {
      return NextResponse.json({ success: false, message: "Only campus emails are allowed (e.g. it12345678@my.sliit.lk)." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid leaking whether an email is registered
      return NextResponse.json({ success: true, message: "If this email is registered, a reset code has been sent." });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const normalizedEmail = email.toLowerCase().trim();

    await sendResetOtpEmail({ to: normalizedEmail, otp });

    await PasswordReset.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, otp, verified: false, attempts: 0, expiresAt },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: "If this email is registered, a reset code has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
