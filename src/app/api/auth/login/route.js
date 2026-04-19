// backend api for user login

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";
import { validateLogin } from "@/lib/validations";

export async function POST(request) {
  try {
    // get email and password from request
    const body = await request.json();
    const { email, password } = body;

    // check if inputs are correct
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // connect to database
    await connectDB();

    // find the user by their email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // check if admin banned this user
    if (user.isBanned) {
      return Response.json(
        { success: false, message: "Your account has been suspended by an administrator." },
        { status: 403 }
      );
    }

    // check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // create token to keep user logged in
    const token = createToken(user);
    await setAuthCookie(token);

    // send success response with user basic details
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
