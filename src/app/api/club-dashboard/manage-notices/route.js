// Feature Domain: Club Management & Operations

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET notices belonging to the authenticated club
export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const club = await Club.findById(caller.clubId).lean();
        if (!club) {
            return NextResponse.json({ error: "Club not found" }, { status: 404 });
        }

        const notices = await Notice.find({ club: club.name }).sort({ createdAt: -1 }).lean();

        const formatted = notices.map(n => ({
            id: n._id.toString(),
            title: n.title,
            content: n.content,
            priority: n.priority,
            createdAt: n.createdAt,
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Fetch club notices error:", error);
        return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
    }
}
