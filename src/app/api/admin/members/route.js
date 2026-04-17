// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller || (caller.role !== "mainAdmin" && caller.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        // Fetch all students
        const members = await User.find({ role: "student" }).sort({ createdAt: -1 }).lean();

        const formattedMembers = members.map((member) => ({
            id: member._id.toString(),
            name: member.name,
            email: member.email,
            university: member.university || "Unknown",
            studentId: member.studentId || "N/A",
            bio: member.bio || "No bio available.",
            isBanned: member.isBanned || false,
            createdAt: member.createdAt,
        }));

        return NextResponse.json({ success: true, data: formattedMembers });
    } catch (error) {
        console.error("Fetch manage members error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
    }
}
