import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Verify caller is mainAdmin using real JWT auth
    const caller = await getCurrentUser();
    if (!caller || caller.role !== "mainAdmin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Main Admin can create admin accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    }, { status: 201 });

  } catch (error) {
    console.error("Create Admin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
