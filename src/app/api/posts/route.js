// Feature Domain: Club Management & Operations

import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Club from "@/models/Club";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// GET all posts
export async function GET() {
    try {
        await connectDB();
        const posts = await Post.find().sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return NextResponse.json({ error: "Failed to connect to database or fetch posts" }, { status: 500 });
    }
}

// CREATE post — only authenticated club accounts
export async function POST(req) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized: Only registered Clubs can create posts." }, { status: 403 });
        }

        await connectDB();

        // Resolve the club's name from the database
        const club = await Club.findById(caller.clubId).lean();
        if (!club) {
            return NextResponse.json({ error: "Club account not found." }, { status: 404 });
        }
        const clubName = club.name;

        const { content, image } = await req.json();

        // check post content rules
        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Post content is required." }, { status: 400 });
        }
        if (content.length > 1000) {
            return NextResponse.json({ error: "Post content cannot exceed 1000 characters." }, { status: 400 });
        }

        let imageUrl = null;

        // Extract and save Base64 image locally
        if (image && image.startsWith("data:image")) {
            const matches = image.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);

            if (matches && matches.length === 3) {
                const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, "base64");

                // Ensure upload directory exists
                const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");
                try {
                    await fs.access(uploadDir);
                } catch {
                    await fs.mkdir(uploadDir, { recursive: true });
                }

                // Generate a unique filename
                const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
                const filePath = path.join(uploadDir, uniqueFileName);

                // Save file
                await fs.writeFile(filePath, buffer);

                // Store relative public path in database
                imageUrl = `/uploads/posts/${uniqueFileName}`;
            }
        }

        const newPost = await Post.create({
            content,
            clubName,
            image: imageUrl
        });

        // Trigger Notifications for all active users
        try {
            const users = await User.find({ role: { $in: ["student", "club"] } }).select("_id");
            console.log(`[DEBUG] Found ${users.length} users for post notifications.`);
            if (users.length > 0) {
                const notifications = users
                    .map(u => ({
                        userId: u._id,
                        title: `New Post from ${clubName}`,
                        message: content.length > 50 ? content.substring(0, 47) + "..." : content,
                        type: "post",
                        link: `/clubs/${caller.clubId}`,
                        clubName: clubName
                    }));
                if (notifications.length > 0) {
                    const result = await Notification.insertMany(notifications);
                    console.log(`[DEBUG] Successfully inserted ${result.length} notifications.`);
                }
            }
        } catch (notifyError) {
            console.error("Failed to trigger post notifications:", notifyError);
            // Don't fail the post creation if notifications fail
        }

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
    }
}