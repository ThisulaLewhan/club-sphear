// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "mainAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        // Find all clubs
        const clubs = await Club.find({}).sort({ createdAt: -1 }).lean();

        // Enhance with admin emails by looking up Users referencing the clubId
        const enrichedClubs = await Promise.all(
            clubs.map(async (club) => {
                const clubUser = await User.findOne({ clubId: club._id, role: "club" }).lean();
                return {
                    id: club._id.toString(),
                    name: club.name,
                    category: club.category || "Uncategorized",
                    description: club.description || "",
                    email: clubUser ? clubUser.email : "No account found",
                    createdAt: club.createdAt,
                };
            })
        );

        return NextResponse.json({ success: true, data: enrichedClubs });
    } catch (error) {
        console.error("Fetch manage clubs error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch clubs" }, { status: 500 });
    }
}
