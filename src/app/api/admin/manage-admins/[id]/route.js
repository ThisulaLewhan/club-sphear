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

// PATCH — promote sub-admin to mainAdmin or demote mainAdmin to sub-admin
export async function PATCH(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "mainAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const params = await context.params;
        const adminId = params.id;

        if (!adminId) {
            return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
        }

        const { action } = await req.json();

        if (!action || !["promote", "demote"].includes(action)) {
            return NextResponse.json({ error: "Invalid action. Must be 'promote' or 'demote'" }, { status: 400 });
        }

        // Cannot demote yourself
        if (action === "demote" && adminId === caller.userId) {
            return NextResponse.json({ error: "You cannot demote your own account" }, { status: 400 });
        }

        await connectDB();

        const targetAdmin = await User.findById(adminId);

        if (!targetAdmin) {
            return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
        }

        if (action === "promote") {
            if (targetAdmin.role === "mainAdmin") {
                return NextResponse.json({ error: "This user is already a Main Admin" }, { status: 400 });
            }
            if (targetAdmin.role !== "admin") {
                return NextResponse.json({ error: "Can only promote sub-admin accounts" }, { status: 400 });
            }
            targetAdmin.role = "mainAdmin";
        } else {
            // demote
            if (targetAdmin.role === "admin") {
                return NextResponse.json({ error: "This user is already a Sub Admin" }, { status: 400 });
            }
            if (targetAdmin.role !== "mainAdmin") {
                return NextResponse.json({ error: "Can only demote mainAdmin accounts" }, { status: 400 });
            }
            targetAdmin.role = "admin";
        }

        await targetAdmin.save();

        return NextResponse.json({
            success: true,
            message: `Admin ${action === "promote" ? "promoted to Main Admin" : "demoted to Sub Admin"} successfully`,
            data: { id: targetAdmin._id.toString(), role: targetAdmin.role }
        });
    } catch (error) {
        console.error("Promote/demote admin error:", error);
        return NextResponse.json({ success: false, error: "Failed to update admin role" }, { status: 500 });
    }
}
