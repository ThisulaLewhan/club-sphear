// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || (caller.role !== "mainAdmin" && caller.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
        }

        const body = await request.json();
        const { isBanned } = body;

        await connectDB();

        const member = await User.findOne({ _id: id, role: "student" });
        
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Apply ban status
        member.isBanned = Boolean(isBanned);
        await member.save();

        return NextResponse.json({ 
            success: true, 
            message: `Member ${isBanned ? 'banned' : 'unbanned'} successfully` 
        });

    } catch (error) {
        console.error("Ban member error:", error);
        return NextResponse.json({ success: false, error: "Failed to update member status" }, { status: 500 });
    }
}
