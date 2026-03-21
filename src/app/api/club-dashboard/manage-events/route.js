import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const caller = await getCurrentUser();
        // Ensure caller is a club
        if (!caller || caller.role !== "club") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!caller.clubId) {
            return NextResponse.json({ error: "No club relationship found for this account." }, { status: 400 });
        }

        await connectDB();

        // Fetch events created by this club
        const events = await Event.find({ clubId: caller.clubId }).sort({ createdAt: -1 }).lean();

        const formattedEvents = events.map((event) => ({
            id: event._id.toString(),
            title: event.title,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue,
            status: event.status,
            createdAt: event.createdAt,
        }));

        return NextResponse.json({ success: true, data: formattedEvents });
    } catch (error) {
        console.error("Fetch club manage events error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
    }
}
