import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";

export async function PUT(req) {
  try {
    const isAuthorized = await hasRole(["mainAdmin", "admin"]);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await getCurrentUser();
    const body = await req.json();
    const { name, password } = body;

    await connectDB();

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = password; // Note: Ensure hashing in production auth system

    const updatedUser = await User.findByIdAndUpdate(user.id, updateData, { new: true });
    
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: { name: updatedUser.name, email: updatedUser.email } 
    });

  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
