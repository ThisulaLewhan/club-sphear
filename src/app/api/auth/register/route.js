/**
 * POST /api/auth/register
 * =======================
 * Student Registration Endpoint
 * 
 * Business Rules:
 * - All required fields must be provided (name, email, password)
 * - Email must be valid format
 * - Email must be verified via OTP before registration
 * - Email must be unique (no duplicate accounts)
 * - Password must meet strength requirements (6+ chars, upper, lower, number)
 * - Password and confirmPassword must match
 * - Password is hashed before storage (bcryptjs)
 * - Role is always set to "student" (cannot be overridden)
 * - Returns success message on successful registration
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerification from "@/models/EmailVerification";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";
import { validateRegistration } from "@/lib/validations";

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate all fields
    const validation = validateRegistration({ name, email, password, confirmPassword });
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify that email has been OTP verified
    const emailVerification = await EmailVerification.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!emailVerification || !emailVerification.verified) {
      return Response.json(
        {
          success: false,
          message: "Email must be verified before registration. Please verify your email with OTP first.",
          errors: { email: "Email not verified" },
        },
        { status: 400 }
      );
    }

    // Check if email already exists (additional safety check)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return Response.json(
        { success: false, message: "An account with this email already exists", errors: { email: "Email already in use" } },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student user (role forced to "student")
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student", // Always student — cannot be overridden
    });

    // Clean up verification record after successful registration
    await EmailVerification.deleteOne({ email: email.toLowerCase().trim() });

    // Create JWT and set auth cookie
    const token = createToken(newUser);
    await setAuthCookie(token);

    // Return success (never expose password)
    return Response.json(
      {
        success: true,
        message: "Registration successful! Welcome to Club Sphear.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
