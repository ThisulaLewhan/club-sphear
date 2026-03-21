/**
 * GET  /api/auth/me  — Get current authenticated user profile
 * PUT  /api/auth/me  — Update current authenticated user profile
 * ============================================================
 * 
 * Business Rules (GET):
 * - Only authenticated users can access
 * - Returns user profile without password
 * 
 * Business Rules (PUT):
 * - Only authenticated students can update their own profile
 * - Students CANNOT modify: role, email, password (through this endpoint)
 * - Allowed fields: name, university, studentId, bio
 * - Validates all fields before saving
 * - Returns updated user data
 * 
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { validateProfileUpdate } from "@/lib/validations";

export async function GET() {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch full user data (exclude password)
    const user = await User.findById(currentUser.userId).select("-password");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          university: user.university || "",
          studentId: user.studentId || "",
          bio: user.bio || "",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate profile update fields
    const validation = validateProfileUpdate(body);
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Build safe update object — only allowed fields
    const allowedFields = ["name", "university", "studentId", "bio"];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
      }
    }

    // Update the user's own profile only
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return fresh user data
    return Response.json(
      {
        success: true,
        message: "Profile updated successfully!",
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          university: updatedUser.university || "",
          studentId: updatedUser.studentId || "",
          bio: updatedUser.bio || "",
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
