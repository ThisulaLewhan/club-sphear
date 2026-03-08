import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
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

// CREATE post
export async function POST(req) {
    try {
        const { content, clubName, image } = await req.json();

        if (!content || !clubName || !image) {
            return NextResponse.json({ error: "All fields including an image are required" }, { status: 400 });
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

        await connectDB();
        const newPost = await Post.create({
            content,
            clubName,
            image: imageUrl // Now this is a lean URL path instead of a massive Base64 string!
        });

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
    }
}