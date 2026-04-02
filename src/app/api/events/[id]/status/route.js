import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import { hasRole } from "@/lib/auth";

export async function PATCH(req, { params }) {
    try {
        const isAuthorized = await hasRole(["mainAdmin", "admin"]);
        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { status } = await req.json();

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "Invalid status update." },
                { status: 400 }
            );
        }

        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json(
                { success: false, error: "Event not found." },
                { status: 404 }
            );
        }

        // Handle edit approval logic
        if (event.pendingEdit) {
            if (status === "approved") {
                // Apply the pending edits to the main event
                event.title = event.pendingEdit.title;
                event.description = event.pendingEdit.description;
                event.date = event.pendingEdit.date;
                event.startTime = event.pendingEdit.startTime;
                event.endTime = event.pendingEdit.endTime;
                event.venue = event.pendingEdit.venue;
                event.registrationLink = event.pendingEdit.registrationLink;
                if (event.pendingEdit.imageUrl) {
                    event.imageUrl = event.pendingEdit.imageUrl;
                }
            }
            // For both approval and rejection of edits, we clear the pendingEdit block
            event.pendingEdit = undefined;
            // We do NOT change the event status (it stays "approved")
        } else {
            // Regular event status update
            event.status = status;
        }

        await event.save();

        return NextResponse.json({ success: true, data: event }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
