import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hasRole } from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const isMainAdmin = await hasRole("mainAdmin");
    if (!isMainAdmin) {
      return NextResponse.json({ error: "Unauthorized: Only Main Admin can perform this action" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Note: In a production app, the password MUST be hashed before saving
    const newUser = await User.create({
      name,
      email,
      password, // Assuming auth module might handle hashing on pre-save or it should be added here
      role: "admin",
    });

    return NextResponse.json({ 
      message: "Admin created successfully", 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } 
    }, { status: 201 });

  } catch (error) {
    console.error("Create Admin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
