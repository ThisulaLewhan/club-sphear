import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

// GET: Fetch all contact messages
export async function GET() {
    try {
        const caller = await getCurrentUser();
        // Allow both mainAdmin and admin
        if (!caller || (caller.role !== "admin" && caller.role !== "mainAdmin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        // Sort by newest first
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching admin messages:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
