import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "mainAdmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        // Find all sub-admins
        const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 }).lean();

        const formattedAdmins = admins.map((admin) => ({
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            createdAt: admin.createdAt,
        }));

        return NextResponse.json({ success: true, data: formattedAdmins });
    } catch (error) {
        console.error("Fetch manage admins error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch admins" }, { status: 500 });
    }
}
