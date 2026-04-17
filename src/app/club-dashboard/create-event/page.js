"use client";

// Feature Domain: Club Management & Operations


import EventForm from "@/components/events/EventForm";

export default function ClubCreateEventPage() {
    return (
        <div className="w-full max-w-4xl mx-auto py-2">
            <div className="mb-6 px-2">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Create Event</h1>
                <p className="text-slate-500 text-sm">Submit a new event for admin approval. We'll verify venue and time slots for conflicts instantly.</p>
            </div>
            <div className="w-full">
                <EventForm />
            </div>
        </div>
    );
}
