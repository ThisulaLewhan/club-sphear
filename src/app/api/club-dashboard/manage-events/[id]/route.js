import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req, context) {
    try {
        const caller = await getCurrentUser();
        // Ensure caller is a club
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!caller.clubId) {
            return NextResponse.json({ error: "No club relationship found for this account." }, { status: 400 });
        }

        // Await context.params for Next.js 15 compatibility
        const params = await context.params;
        const eventId = params.id;

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        await connectDB();

        // 1. Ensure the event actually belongs to the calling club
        const targetEvent = await Event.findById(eventId);

        if (!targetEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (targetEvent.clubId.toString() !== caller.clubId.toString()) {
            return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 });
        }

        // 2. Delete the associated image from filesystem if it exists
        if (targetEvent.imageUrl && targetEvent.imageUrl.startsWith('/uploads/events/')) {
            try {
                const filePath = path.join(process.cwd(), "public", targetEvent.imageUrl);
                await fs.unlink(filePath);
            } catch (err) {
                // Ignore if file is already missing
                console.error("Could not delete image file:", err);
            }
        }

        // 3. Delete the event document
        await Event.findByIdAndDelete(eventId);

        return NextResponse.json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        console.error("Delete club event error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
    }
}
