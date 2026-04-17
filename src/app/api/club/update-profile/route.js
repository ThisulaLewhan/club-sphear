// Feature Domain: Club Management & Operations

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { validatePassword } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    const isAuthorized = await hasRole("club");
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Only Club accounts can perform this action" }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user.clubId) {
       return NextResponse.json({ error: "No associated club found for this user account" }, { status: 400 });
    }

    const body = await req.json();
    const { name, password, description, logo } = body;

    // name and description lengths
    if (name && name.trim().length < 2) {
      return NextResponse.json({ error: "Club Name must be at least 2 characters." }, { status: 400 });
    }
    if (description && description.length > 500) {
      return NextResponse.json({ error: "Description must be under 500 characters." }, { status: 400 });
    }
    if (password) {
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        return NextResponse.json({ error: pwCheck.message }, { status: 400 });
      }
    }

    await connectDB();

    // 1. Update User Details (Auth mapping)
    const userUpdateData = {};
    if (password) {
      const salt = await bcrypt.genSalt(12);
      userUpdateData.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(user.id, userUpdateData);
    }

    // 2. Update Club details
    const clubUpdateData = {};
    if (description !== undefined) clubUpdateData.description = description;
    if (logo) clubUpdateData.logo = logo;
    
    // Changing the club name is usually sensitive and could break URL slugs/uniqueness.
    // We enforce name checks if name is provided.
    if (name) {
      const existing = await Club.findOne({ name, _id: { $ne: user.clubId } });
      if (existing) {
        return NextResponse.json({ error: "Club name already taken by another entity" }, { status: 400 });
      }
      clubUpdateData.name = name;
      await User.findByIdAndUpdate(user.id, { name }); // keep user name in sync with club name
    }

    if (Object.keys(clubUpdateData).length > 0) {
      await Club.findByIdAndUpdate(user.clubId, clubUpdateData);
    }

    return NextResponse.json({ message: "Club profile updated successfully" });

  } catch (error) {
    console.error("Update Club Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
