import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { isValidEmail, validatePassword } from "@/lib/validations";
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

    // restrict name length on backend
    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    // valid email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // strict password validation
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
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
