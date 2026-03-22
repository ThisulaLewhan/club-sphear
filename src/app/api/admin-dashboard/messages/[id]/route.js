import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

// PUT: Mark message as read
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const caller = await getCurrentUser();
        
        if (!caller || (caller.role !== "admin" && caller.role !== "mainAdmin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { status: "read" },
            { new: true }
        );

        if (!message) {
            return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: message });
    } catch (error) {
        console.error("Error updating message status:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

// DELETE: Remove a message
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const caller = await getCurrentUser();
        
        if (!caller || (caller.role !== "admin" && caller.role !== "mainAdmin")) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const deleted = await ContactMessage.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Message deleted successfully." });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
