// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";
import { isValidEmail, validatePassword } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Verify caller is mainAdmin using real JWT auth
    const caller = await getCurrentUser();
    if (!caller || caller.role !== "mainAdmin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Main Admin can create clubs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { clubName, category, description, clubEmail, password } = body;

    if (!clubName || !category || !clubEmail || !password) {
      return NextResponse.json({ error: "Club name, category, email, and password are required" }, { status: 400 });
    }

    // backend length and format checks
    if (clubName.trim().length < 2) {
      return NextResponse.json({ error: "Club name must be at least 2 characters" }, { status: 400 });
    }
    if (!isValidEmail(clubEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    await connectDB();

    // Check for duplicate club name
    const existingClub = await Club.findOne({ name: clubName.trim() });
    if (existingClub) {
      return NextResponse.json({ error: "A club with this name already exists" }, { status: 409 });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: clubEmail.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Create Club document
    const newClub = await Club.create({
      name: clubName.trim(),
      category,
      description: description || "",
      createdBy: caller.userId,
    });

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User document linked to the club
    const newUser = await User.create({
      name: clubName.trim(),
      email: clubEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: "club",
      clubId: newClub._id,
    });

    return NextResponse.json({
      success: true,
      message: "Club account created successfully",
      club: { id: newClub._id, name: newClub.name },
      user: { id: newUser._id, email: newUser.email, role: newUser.role },
    }, { status: 201 });

  } catch (error) {
    console.error("Create Club Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
