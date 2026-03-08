import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function DELETE(req, { params }) {
    try {
        await connectDB();

        // Find the post first to get the image URL
        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // If it has a local image, delete the file
        if (post.image && post.image.startsWith("/uploads")) {
            try {
                const filePath = path.join(process.cwd(), "public", post.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error("Failed to delete associated image file:", err);
                // Continue with post deletion even if file deletion fails
            }
        }

        await Post.findByIdAndDelete(params.id);

        return NextResponse.json({ message: "Post and associated image deleted" });
    } catch (error) {
        console.error("Failed to delete post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}