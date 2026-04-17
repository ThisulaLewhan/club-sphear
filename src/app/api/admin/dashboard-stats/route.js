import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import Event from "@/models/Event";
import { hasRole } from "@/lib/auth";

export async function GET(req) {
  try {
    const isAuthorized = await hasRole(["mainAdmin", "admin"]);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const [pendingEvents, activeClubs, totalMembers] = await Promise.all([
      Event.countDocuments({
        $or: [
          { status: "pending" },
          { pendingEdit: { $ne: null } }
        ]
      }),
      Club.countDocuments(),
      User.countDocuments({ role: "student" }),
    ]);

    return NextResponse.json({
      success: true,
      pendingEvents,
      activeClubs,
      totalMembers,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
