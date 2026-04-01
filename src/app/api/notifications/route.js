import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET: Fetch notifications for the current user
export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get notifications for this user, sorted by newest first
        const notifications = await Notification.find({ userId: caller.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

// PUT: Mark all notifications as read or a specific one
export async function PUT(request) {
    try {
        const caller = await getCurrentUser();
        if (!caller) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await Notification.updateMany(
                { userId: caller.userId, isRead: false },
                { isRead: true }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: caller.userId },
                { isRead: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update notifications error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
