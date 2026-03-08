/**
 * Send OTP API Route
 * Sends a 6-digit OTP to the provided email address
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerification from "@/models/EmailVerification";
import { isValidEmail } from "@/lib/validations";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * POST /api/auth/send-otp
 * Sends OTP to email address
 * Requirements:
 * - Email must be valid format
 * - Email must not already be registered
 * - OTP expires after 10 minutes
 * - Previous OTP records are replaced
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
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

    // Store/update OTP in database
    await EmailVerification.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        email: email.toLowerCase().trim(),
        otp,
        verified: false,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // In production, send OTP via email service (SendGrid, Nodemailer, etc.)
    // For now, log it to console (NOT SECURE - only for development)
    console.log(`🔐 OTP for ${email}: ${otp} (Expires in 10 minutes)`);

    // TODO: Send email with OTP using nodemailer or SendGrid
    // Example implementation:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject: 'Club Sphear - Email Verification Code',
    //   html: `Your verification code is: <strong>${otp}</strong>. It expires in 10 minutes.`
    // });

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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
