// Feature Domain: Authentication & Access Control

// resets the user's password after OTP is verified

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, newPassword, confirmPassword } = await req.json();

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ success: false, message: "Password must contain at least one uppercase letter." }, { status: 400 });
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({ success: false, message: "Password must contain at least one lowercase letter." }, { status: 400 });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      return NextResponse.json({ success: false, message: "Password must contain at least one special character." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const record = await PasswordReset.findOne({ email: normalizedEmail });
    if (!record || !record.verified) {
      return NextResponse.json({ success: false, message: "OTP not verified. Please complete verification first." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await PasswordReset.deleteOne({ email: normalizedEmail });
      return NextResponse.json({ success: false, message: "Reset session expired. Please start over." }, { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json({ success: false, message: "New password cannot be the same as your current password." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await PasswordReset.deleteOne({ email: normalizedEmail });

    return NextResponse.json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
