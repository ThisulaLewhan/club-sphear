// verifies the 6-digit code user enters

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailVerification from "@/models/EmailVerification";

// api route to handle code verification
export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find OTP record
    const otpRecord = await EmailVerification.findOne({
      email: email.toLowerCase().trim(),
    });

    // Check if OTP exists
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await EmailVerification.deleteOne({ email: email.toLowerCase().trim() });
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempt limit (3 failed attempts)
    if (otpRecord.attempts >= 3) {
      await EmailVerification.deleteOne({ email: email.toLowerCase().trim() });
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Verify OTP (compare as strings)
    if (otpRecord.otp !== otp.toString().trim()) {
      // Increment attempts and update
      otpRecord.attempts += 1;
      await otpRecord.save();

      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. Please try again. (${3 - otpRecord.attempts} attempts remaining)`,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully - mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now complete your registration.",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
