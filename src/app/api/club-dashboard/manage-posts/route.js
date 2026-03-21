// Feature Domain: Club Management & Operations

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET posts belonging to the authenticated club
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

        const posts = await Post.find({ clubName: club.name }).sort({ createdAt: -1 }).lean();

        const formatted = posts.map(p => ({
            id: p._id.toString(),
            content: p.content,
            image: p.image,
            createdAt: p.createdAt,
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Fetch club posts error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
