import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

// UPDATE post — only the owning club
export async function PUT(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const params = await context.params;
        const post = await Post.findById(params.id);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Verify ownership
        const club = await Club.findById(caller.clubId).lean();
        if (!club || post.clubName !== club.name) {
            return NextResponse.json({ error: "Not authorized to edit this post" }, { status: 403 });
        }

        const { content } = await req.json();
        if (content !== undefined) {
            post.content = content;
        }

        await post.save();
        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Update post error:", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

// DELETE post — only the owning club
export async function DELETE(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const params = await context.params;
        const post = await Post.findById(params.id);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Verify ownership
        const club = await Club.findById(caller.clubId).lean();
        if (!club || post.clubName !== club.name) {
            return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 });
        }

        // Delete associated image
        if (post.image && post.image.startsWith('/uploads/posts/')) {
            try {
                const filePath = path.join(process.cwd(), "public", post.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error("Could not delete post image:", err);
            }
        }

        await Post.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}