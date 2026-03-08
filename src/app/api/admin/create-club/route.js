import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";

export async function POST(req) {
  try {
    const isMainAdmin = await hasRole("mainAdmin");
    if (!isMainAdmin) {
      return NextResponse.json({ error: "Unauthorized: Only Main Admin can perform this action" }, { status: 403 });
    }

    const body = await req.json();
    const { clubName, description, clubEmail, password } = body;

    if (!clubName || !clubEmail || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check if club name already exists
    const existingClub = await Club.findOne({ name: clubName });
    if (existingClub) {
      return NextResponse.json({ error: "Club name already exists" }, { status: 400 });
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email: clubEmail });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Create Club Document First
    const currentUser = await getCurrentUser();
    
    const newClub = await Club.create({
      name: clubName,
      description: description || "",
      createdBy: currentUser.id
    });

    // Create User Document assigned to Club
    // Note: Password should be hashed in production
    const newUser = await User.create({
      name: clubName, // Club's user account name correlates to the club name
      email: clubEmail,
      password,
      role: "club",
      clubId: newClub._id
    });

    return NextResponse.json({ 
      message: "Club and account created successfully", 
      club: newClub,
      user: { id: newUser._id, email: newUser.email, role: newUser.role }
    }, { status: 201 });

  } catch (error) {
    console.error("Create Club Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
