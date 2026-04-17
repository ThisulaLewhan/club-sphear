// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "mainAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Await context.params for Next.js 15 compatibility
        const params = await context.params;
        const clubId = params.id;

        if (!clubId) {
            return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
        }

        await connectDB();

        // 1. Delete associated user
        const deletedUser = await User.findOneAndDelete({ clubId: clubId, role: "club" });

        // 2. Delete the club document
        const deletedClub = await Club.findByIdAndDelete(clubId);

        if (!deletedClub) {
            return NextResponse.json({ error: "Club not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Club and associated user account deleted successfully"
        });
    } catch (error) {
        console.error("Delete manage club error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete club" }, { status: 500 });
    }
}
