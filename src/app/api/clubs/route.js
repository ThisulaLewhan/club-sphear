// Feature Domain: Student Experience & Public Content

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const clubs = await Club.find({}).sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: clubs.map((club) => ({
                id: club._id.toString(),
                name: club.name,
                category: club.category || "Uncategorized",
                description: club.description || "",
                logo: club.logo || null,
                coverImage: club.coverImage || null,
            })),
        });
    } catch (error) {
        console.error("Fetch clubs error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch clubs" }, { status: 500 });
    }
}
