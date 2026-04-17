// Feature Domain: Student Experience & Public Content

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";
import Post from "@/models/Post";
import Notice from "@/models/Notice";

export async function GET(req, context) {
    try {
        await connectDB();
        const params = await context.params;
        const clubId = params.id;

        if (!clubId) {
            return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
        }

        const club = await Club.findById(clubId).lean();

        if (!club) {
            return NextResponse.json({ error: "Club not found" }, { status: 404 });
        }

        // Fetch posts for this club
        const posts = await Post.find({ clubName: club.name }).sort({ createdAt: -1 }).lean();

        // Fetch active notices for this club
        const notices = await Notice.find({ 
            club: club.name,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 }).lean();

        // Format the club data
        return NextResponse.json({
            success: true,
            data: {
                id: club._id.toString(),
                name: club.name,
                category: club.category || "Uncategorized",
                description: club.description || "",
                logo: club.logo || null,
                coverImage: club.coverImage || null,
                executiveBoard: club.executiveBoard || [],
                posts: posts.map(post => ({
                    _id: post._id.toString(),
                    clubName: post.clubName,
                    content: post.content,
                    image: post.image,
                    createdAt: post.createdAt,
                })),
                notices: notices.map(notice => ({
                    _id: notice._id.toString(),
                    title: notice.title,
                    content: notice.content,
                    club: notice.club,
                    priority: notice.priority,
                    createdAt: notice.createdAt,
                    expiresAt: notice.expiresAt
                }))
            }
        });
    } catch (error) {
        console.error("Fetch singular club profile error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch club" }, { status: 500 });
    }
}
