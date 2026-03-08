import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
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

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedEvent) {
            return NextResponse.json(
                { success: false, error: "Event not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedEvent }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
