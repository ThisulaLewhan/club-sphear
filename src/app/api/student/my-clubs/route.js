// Feature Domain: Student Experience & Public Content

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ClubApplication from "@/models/ClubApplication";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const approvedApplications = await ClubApplication.find({
            userId: currentUser.userId,
            status: "approved",
        }).lean();

        const clubIds = approvedApplications.map((a) => a.clubId);

        const clubs = await Club.find({ _id: { $in: clubIds } }).lean();

        const clubMap = {};
        clubs.forEach((c) => { clubMap[c._id.toString()] = c; });

        const result = approvedApplications.map((app) => {
            const club = clubMap[app.clubId] || {};
            return {
                clubId: app.clubId,
                clubName: app.clubName,
                category: club.category || "Uncategorized",
                description: club.description || "",
                logo: club.logo || null,
                joinedAt: app.updatedAt,
            };
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("my-clubs error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch clubs" }, { status: 500 });
    }
}
