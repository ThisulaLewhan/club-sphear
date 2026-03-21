// Feature Domain: The Global Admin System

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req, context) {
    try {
        const caller = await getCurrentUser();
        // Only mainAdmin can delete sub-admins
        if (!caller || caller.role !== "mainAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Await context.params for Next.js 15 compatibility
        const params = await context.params;
        const adminId = params.id;

        if (!adminId) {
            return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
        }

        // Prevent mainAdmins from deleting themselves or other mainAdmins
        if (adminId === caller.userId) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }

        await connectDB();

        // Ensure the target is actually just an 'admin' (not mainAdmin)
        const targetAdmin = await User.findById(adminId);

        if (!targetAdmin) {
            return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
        }

        if (targetAdmin.role === "mainAdmin") {
            return NextResponse.json({ error: "Cannot delete a mainAdmin account" }, { status: 403 });
        }

        if (targetAdmin.role !== "admin") {
            return NextResponse.json({ error: "Target is not a sub-admin account" }, { status: 400 });
        }

        // Delete the admin user document
        await User.findByIdAndDelete(adminId);

        return NextResponse.json({
            success: true,
            message: "Sub-admin account deleted successfully"
        });
    } catch (error) {
        console.error("Delete manage admin error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete sub-admin" }, { status: 500 });
    }
}
