import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

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

        const formData = await req.formData();
        const content = formData.get("content");
        const newImage = formData.get("image"); // File or null
        const removeImage = formData.get("removeImage"); // "true" if user deleted image

        // Update caption
        if (content !== null && content !== undefined) {
            post.content = content;
        }

        // Handle image removal or replacement
        if (removeImage === "true" || (newImage && newImage.size > 0)) {
            // Logically "delete" the old image, but we don't need to actually call fs.unlink
            // since production uses Cloudinary and the local FS is read-only.
            // If the old image was a cloudinary URL, removing the DB reference is enough.

            if (newImage && newImage.size > 0) {
                // Upload new image to Cloudinary via buffer
                try {
                    const bytes = await newImage.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    post.image = await uploadBufferToCloudinary(buffer, "club-sphear/posts");
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError);
                    return NextResponse.json({ error: "Failed to upload new image." }, { status: 500 });
                }
            } else {
                // Image was removed without replacement
                post.image = "";
            }
        }

        // Validation: both content and image are required
        if (!post.content || !post.content.trim()) {
            return NextResponse.json({ error: "Caption is required" }, { status: 400 });
        }
        if (!post.image) {
            return NextResponse.json({ error: "Image is required. Please upload a photo." }, { status: 400 });
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

        // (Optional) Here we could use Cloudinary's Destroy API to prune the deleted image,
        // but it's not strictly necessary since the DB reference is gone. Local fs.unlink is removed 
        // to prevent Vercel EROFS errors.

        await Post.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}