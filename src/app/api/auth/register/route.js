// backend api for handling student sign up

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerification from "@/models/EmailVerification";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";
import { validateRegistration } from "@/lib/validations";

export async function POST(request) {
  try {
    // get the body data from user request
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // check if details are correct before moving forward
    const validation = validateRegistration({ name, email, password, confirmPassword });
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // connect to mongodb database
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // check if user verified email with otp
    const emailVerification = await EmailVerification.findOne({ email: normalizedEmail });

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

    // make sure this email is not already used
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return Response.json(
        { success: false, message: "An account with this email already exists", errors: { email: "Email already in use" } },
        { status: 409 }
      );
    }

    // encrypt the password for security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate student id from email username
    const derivedStudentId = normalizedEmail.split("@")[0].toUpperCase();

    // save new student to database
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student", // force role to student for safety
      university: "SLIIT",
      studentId: derivedStudentId,
    });

    // delete otp record since done
    await EmailVerification.deleteOne({ email: normalizedEmail });

    // give browser a token to stay logged in
    const token = createToken(newUser);
    await setAuthCookie(token);

    // send success response back
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
