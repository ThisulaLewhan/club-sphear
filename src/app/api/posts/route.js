// Feature Domain: Club Management & Operations

import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Club from "@/models/Club";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (runs server-side only)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 data URI image to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
function uploadToCloudinary(base64DataUri) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            base64DataUri,
            {
                folder: "club-sphear/posts",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
    });
}

// GET all posts — enriched with club logo for avatar display
export async function GET() {
    try {
        await connectDB();
        const posts = await Post.find().sort({ createdAt: -1 }).lean();

        // Attach the club's logo to each post so the frontend can show it as an avatar
        const enriched = await Promise.all(
            posts.map(async (post) => {
                const club = await Club.findOne({ name: post.clubName }).select("logo").lean();
                return { ...post, clubLogo: club?.logo || null };
            })
        );

        return NextResponse.json(enriched);
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

        // Check post content rules
        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Post content is required." }, { status: 400 });
        }
        if (content.length > 1000) {
            return NextResponse.json({ error: "Post content cannot exceed 1000 characters." }, { status: 400 });
        }

        let imageUrl = null;

        // Upload image to Cloudinary (works on Vercel — no filesystem needed)
        if (image && image.startsWith("data:image")) {
            try {
                imageUrl = await uploadToCloudinary(image);
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
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
                    await Notification.insertMany(notifications);
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