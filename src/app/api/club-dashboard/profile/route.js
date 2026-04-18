import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import { uploadBase64ToCloudinary } from "@/lib/cloudinary";

export const dynamic = 'force-dynamic';

// GET: Fetch club profile details
export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const user = await User.findById(caller.userId).select("-password");
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const club = await Club.findById(user.clubId);
        if (!club) {
            return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                clubName: club.name,
                category: club.category,
                description: club.description || "",
                logo: club.logo || "",
                coverImage: club.coverImage || "",
                executiveBoard: club.executiveBoard || [],
            },
        });
    } catch (error) {
        console.error("Error fetching club profile:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

// PUT: Update club profile details
export async function PUT(request) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { clubName, category, description, logo, coverImage, executiveBoard } = body;

        // Validate
        if (!clubName || clubName.trim().length < 2) {
            return NextResponse.json({ success: false, error: "Club name must be at least 2 characters." }, { status: 400 });
        }

        if (description && description.length > 500) {
            return NextResponse.json({ success: false, error: "Description must be under 500 characters." }, { status: 400 });
        }

        const validCategories = [
            "Technology & Innovation",
            "Academic & Professional",
            "Arts & Humanities",
            "Business & Leadership",
            "Community & Social",
            "Media & Communications",
            "Recreation & Esports",
        ];
        if (category && !validCategories.includes(category)) {
            return NextResponse.json({ success: false, error: "Invalid category." }, { status: 400 });
        }

        // Check for duplicate club name (if changed)
        const club = await Club.findById(caller.clubId);
        if (!club) {
            return NextResponse.json({ success: false, error: "Club not found" }, { status: 404 });
        }

        if (clubName.trim() !== club.name) {
            const existing = await Club.findOne({ name: clubName.trim() });
            if (existing) {
                return NextResponse.json({ success: false, error: "A club with this name already exists." }, { status: 409 });
            }
        }

        // Handle Logo Update
        if (logo && logo.startsWith("data:image")) {
            try {
                club.logo = await uploadBase64ToCloudinary(logo, "club-sphear/logos");
            } catch (uploadError) {
                console.error("Failed to upload club logo to Cloudinary:", uploadError);
                return NextResponse.json({ success: false, error: "Logo upload failed." }, { status: 500 });
            }
        }

        // Handle Cover Image Update
        if (coverImage && coverImage.startsWith("data:image")) {
            try {
                club.coverImage = await uploadBase64ToCloudinary(coverImage, "club-sphear/covers");
            } catch (uploadError) {
                console.error("Failed to upload cover image to Cloudinary:", uploadError);
                return NextResponse.json({ success: false, error: "Cover image upload failed." }, { status: 500 });
            }
        }

        // Update Club document
        club.name = clubName.trim();
        if (category) club.category = category;
        if (description !== undefined) club.description = description.trim();
        if (executiveBoard) club.executiveBoard = executiveBoard;
        await club.save();

        // Also update the User name to match club name
        await User.findByIdAndUpdate(caller.userId, { name: clubName.trim() });

        return NextResponse.json({
            success: true,
            data: {
                clubName: club.name,
                category: club.category,
                description: club.description,
                logo: club.logo,
                coverImage: club.coverImage,
                executiveBoard: club.executiveBoard,
            },
        });
    } catch (error) {
        console.error("Error updating club profile:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
