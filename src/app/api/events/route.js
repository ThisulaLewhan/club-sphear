import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let query = {};
        if (status && status !== "all") {
            query.status = status;
        }

        // Sort by date ascending (closest events first)
        const events = await Event.find(query).sort({ date: 1, startTime: 1 });
        return NextResponse.json({ success: true, data: events }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();

        // Parse the incoming multipart/form-data
        const formData = await req.formData();

        // Extract fields
        const title = formData.get("title");
        const description = formData.get("description");
        const date = formData.get("date");
        const startTime = formData.get("startTime");
        const endTime = formData.get("endTime");
        const venue = formData.get("venue");
        const registrationLink = formData.get("registrationLink");
        const clubId = formData.get("clubId");

        // Time Validation
        if (startTime >= endTime) {
            return NextResponse.json(
                { success: false, error: "End time must be after start time." },
                { status: 400 }
            );
        }

        // Conflict Detection
        // Check for any approved or pending events at the exact same date and venue
        const conflictingEvents = await Event.find({
            date: new Date(date),
            venue,
            status: { $in: ["pending", "approved"] },
        });

        for (let event of conflictingEvents) {
            // Logic for time overlap: max(start1, start2) < min(end1, end2)
            if (startTime < event.endTime && endTime > event.startTime) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Venue conflict detectd. Timeslot overlaps with an existing ${event.status} event: "${event.title}" (${event.startTime} - ${event.endTime}).`,
                    },
                    { status: 409 }
                );
            }
        }

        // Handle Image Upload if present
        let imageUrl = null;
        const imageFile = formData.get("image");
        console.log("Image File Extracted:", imageFile ? "Exists" : "Null", typeof imageFile, imageFile);

        if (imageFile && (imageFile.name || imageFile.size > 0)) {
            try {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const extension = path.extname(imageFile.name) || ".jpg"; // fallback if no ext
                // Generate a safe unique filename to prevent collisions and sanitize
                const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

                // Construct path to `public/uploads/events` directory relative to the project root
                const uploadDir = path.join(process.cwd(), "public/uploads/events");

                // Ensure the directory exists
                await fs.mkdir(uploadDir, { recursive: true });

                // Write the file locally
                await fs.writeFile(path.join(uploadDir, filename), buffer);

                // Save the relative URL so the frontend can hit it natively via Next.js router
                imageUrl = `/uploads/events/${filename}`;
            } catch (fsError) {
                console.error("Failed to save image to filesystem:", fsError);
                return NextResponse.json(
                    { success: false, error: "Failed to process image upload on the server." },
                    { status: 500 }
                );
            }
        }

        // No conflicts, create the event
        const newEvent = await Event.create({
            title,
            description,
            date,
            startTime,
            endTime,
            venue,
            registrationLink,
            clubId,
            imageUrl, // Append newly constructed image url natively
            status: "pending", // Always default to pending
        });

        return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
    } catch (error) {
        console.error("POST event error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
