import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";

// UPDATE notice — only the owning club
export async function PUT(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const params = await context.params;
        const notice = await Notice.findById(params.id);

        if (!notice) {
            return NextResponse.json({ error: "Notice not found" }, { status: 404 });
        }

        // Verify ownership
        const club = await Club.findById(caller.clubId).lean();
        if (!club || notice.club !== club.name) {
            return NextResponse.json({ error: "Not authorized to edit this notice" }, { status: 403 });
        }

        const { title, content, priority } = await req.json();
        if (title !== undefined) notice.title = title;
        if (content !== undefined) notice.content = content;
        if (priority !== undefined) notice.priority = priority;

        await notice.save();
        return NextResponse.json({ success: true, data: notice });
    } catch (error) {
        console.error("Update notice error:", error);
        return NextResponse.json({ error: "Failed to update notice" }, { status: 500 });
    }
}

// DELETE notice — only the owning club
export async function DELETE(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club" || !caller.clubId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const params = await context.params;
        const notice = await Notice.findById(params.id);

        if (!notice) {
            return NextResponse.json({ error: "Notice not found" }, { status: 404 });
        }

        // Verify ownership
        const club = await Club.findById(caller.clubId).lean();
        if (!club || notice.club !== club.name) {
            return NextResponse.json({ error: "Not authorized to delete this notice" }, { status: 403 });
        }

        await Notice.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
        console.error("Delete notice error:", error);
        return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
    }
}
