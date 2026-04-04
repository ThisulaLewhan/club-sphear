// Feature Domain: Authentication & Access Control

// fetches or updates current logged in user profile

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

    // Backfill/correct studentId and university from email
    if (user.role === "student") {
      const emailLocal = user.email.split("@")[0].toUpperCase();
      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      let needsSave = false;
      if (user.studentId !== emailLocal) {
        user.studentId = emailLocal;
        needsSave = true;
      }
      if (!user.university && emailDomain?.includes("sliit")) {
        user.university = "SLIIT";
        needsSave = true;
      }
      if (needsSave) await user.save();
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
          clubId: user.clubId ? user.clubId.toString() : null,
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
          clubId: updatedUser.clubId ? updatedUser.clubId.toString() : null,
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
