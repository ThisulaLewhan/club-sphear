import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// PUT: Change club account password
export async function PUT(request) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, error: "New password must be at least 6 characters." }, { status: 400 });
        }

        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json({ success: false, error: "Password must contain at least one uppercase letter." }, { status: 400 });
        }

        if (!/[a-z]/.test(newPassword)) {
            return NextResponse.json({ success: false, error: "Password must contain at least one lowercase letter." }, { status: 400 });
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
            return NextResponse.json({ success: false, error: "Password must contain at least one special character." }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ success: false, error: "New passwords do not match." }, { status: 400 });
        }

        const user = await User.findById(caller.userId);
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
