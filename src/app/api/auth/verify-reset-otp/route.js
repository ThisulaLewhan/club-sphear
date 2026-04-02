// Feature Domain: Authentication & Access Control

// verifies the 6-digit password reset code

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PasswordReset from "@/models/PasswordReset";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required." }, { status: 400 });
    }

    await connectDB();

    const record = await PasswordReset.findOne({ email: email.toLowerCase().trim() });

    if (!record) {
      return NextResponse.json({ success: false, message: "OTP not found. Please request a new code." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await PasswordReset.deleteOne({ email: email.toLowerCase().trim() });
      return NextResponse.json({ success: false, message: "OTP has expired. Please request a new code." }, { status: 400 });
    }

    if (record.attempts >= 3) {
      await PasswordReset.deleteOne({ email: email.toLowerCase().trim() });
      return NextResponse.json({ success: false, message: "Too many failed attempts. Please request a new code." }, { status: 400 });
    }

    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      await record.save();
      return NextResponse.json(
        { success: false, message: `Invalid OTP. Please try again. (${3 - record.attempts} attempts remaining)` },
        { status: 400 }
      );
    }

    record.verified = true;
    await record.save();

    return NextResponse.json({ success: true, message: "OTP verified. You can now reset your password." });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
