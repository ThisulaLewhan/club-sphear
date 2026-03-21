// Feature Domain: Authentication & Access Control

// login api route

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";
import { validateLogin } from "@/lib/validations";

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token and set cookie
    const token = createToken(user);
    await setAuthCookie(token);

    // Return success with user info (never expose password)
    return Response.json(
      {
        success: true,
        message: "Login successful!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
