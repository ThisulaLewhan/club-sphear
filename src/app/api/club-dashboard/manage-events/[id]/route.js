// Feature Domain: Club Management & Operations

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { validateEvent } from "@/lib/validations";

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

// ── PUT: Submit an edit for an approved event (requires re-approval) ──────────
export async function PUT(req, context) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (!caller.clubId) {
            return NextResponse.json({ error: "No club relationship found." }, { status: 400 });
        }

        const params = await context.params;
        const eventId = params.id;
        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        await connectDB();

        const targetEvent = await Event.findById(eventId);
        if (!targetEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        if (targetEvent.clubId.toString() !== caller.clubId.toString()) {
            return NextResponse.json({ error: "Not authorized to edit this event" }, { status: 403 });
        }
        if (targetEvent.status !== "approved") {
            return NextResponse.json({ error: "Only approved events can be edited." }, { status: 400 });
        }
        if (targetEvent.pendingEdit) {
            return NextResponse.json({ error: "This event already has a pending edit awaiting review." }, { status: 400 });
        }

        // Parse multipart form data
        const formData = await req.formData();
        const editData = {
            title: formData.get("title"),
            description: formData.get("description"),
            date: formData.get("date"),
            startTime: formData.get("startTime"),
            endTime: formData.get("endTime"),
            venue: formData.get("venue"),
            registrationLink: formData.get("registrationLink"),
        };

        // Handle optional image upload
        const imageFile = formData.get("image");
        let editImageUrl = targetEvent.imageUrl; // Keep existing by default

        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            try {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const extension = path.extname(imageFile.name) || ".jpg";
                const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
                const uploadDir = path.join(process.cwd(), "public/uploads/events");
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(path.join(uploadDir, filename), buffer);
                editImageUrl = `/uploads/events/${filename}`;
            } catch (fsError) {
                console.error("Failed to save edit image:", fsError);
                return NextResponse.json({ error: "Failed to process image upload." }, { status: 500 });
            }
        }

        // Validate the edited data (image is optional in edit mode since we keep existing)
        const validationPayload = { ...editData, image: editImageUrl ? { size: 1, type: "image/jpeg" } : null };
        // We skip image validation for edits since the event already has an image
        // Just validate the text fields
        if (!editData.title || editData.title.trim().length < 3) {
            return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });
        }
        if (!editData.date) {
            return NextResponse.json({ error: "Event date is required" }, { status: 400 });
        }
        if (!editData.startTime || !editData.endTime) {
            return NextResponse.json({ error: "Start time and end time are required" }, { status: 400 });
        }
        if (editData.startTime >= editData.endTime) {
            return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
        }
        if (!editData.venue || !editData.venue.trim()) {
            return NextResponse.json({ error: "Venue is required" }, { status: 400 });
        }

        // Store the pending edit
        targetEvent.pendingEdit = {
            title: editData.title,
            description: editData.description || "",
            date: new Date(editData.date),
            startTime: editData.startTime,
            endTime: editData.endTime,
            venue: editData.venue,
            registrationLink: editData.registrationLink || "",
            imageUrl: editImageUrl,
            submittedAt: new Date(),
        };

        await targetEvent.save();

        return NextResponse.json({
            success: true,
            message: "Edit submitted for admin approval.",
            data: targetEvent,
        });
    } catch (error) {
        console.error("PUT edit event error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit edit" }, { status: 500 });
    }
}
