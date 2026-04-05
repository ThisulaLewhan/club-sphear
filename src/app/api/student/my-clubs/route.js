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

        // Fetch approved, rejected, and pending applications in one go
        const [approvedApplications, rejectedApplications, pendingApplications] = await Promise.all([
            ClubApplication.find({ userId: currentUser.userId, status: "approved" }).lean(),
            ClubApplication.find({ userId: currentUser.userId, status: "rejected" }).lean(),
            ClubApplication.find({ userId: currentUser.userId, status: "pending" }).lean(),
        ]);

        // Collect all club IDs from all three lists
        const allClubIds = [
            ...approvedApplications.map((a) => a.clubId),
            ...rejectedApplications.map((a) => a.clubId),
            ...pendingApplications.map((a) => a.clubId),
        ];

        const clubs = await Club.find({ _id: { $in: allClubIds } }).lean();
        const clubMap = {};
        clubs.forEach((c) => { clubMap[c._id.toString()] = c; });

        const buildEntry = (app, extra = {}) => {
            const club = clubMap[app.clubId] || {};
            return {
                applicationId: app._id,
                clubId: app.clubId,
                clubName: app.clubName,
                category: club.category || "Uncategorized",
                description: club.description || "",
                logo: club.logo || null,
                ...extra,
            };
        };

        // Deduplicate by clubId — keep the most recent entry per club
        const dedupeByClub = (apps) => {
            const map = {};
            apps.forEach((app) => {
                const existing = map[app.clubId];
                if (!existing || new Date(app.updatedAt) > new Date(existing.updatedAt)) {
                    map[app.clubId] = app;
                }
            });
            return Object.values(map);
        };

        const approvedResult = approvedApplications.map((app) => buildEntry(app, { joinedAt: app.updatedAt }));
        const rejectedResult = dedupeByClub(rejectedApplications).map((app) => buildEntry(app, { rejectedAt: app.updatedAt }));
        const pendingResult  = dedupeByClub(pendingApplications).map((app)  => buildEntry(app, { appliedAt: app.createdAt }));

        return NextResponse.json({ success: true, data: approvedResult, rejected: rejectedResult, pending: pendingResult });
    } catch (error) {
        console.error("my-clubs error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch clubs" }, { status: 500 });
    }
}
