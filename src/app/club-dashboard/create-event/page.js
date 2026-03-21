"use client";

import EventForm from "@/components/events/EventForm";

export default function ClubCreateEventPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Event</h1>
            <p className="text-slate-500 text-sm mb-6">Submit a new event for admin approval.</p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <EventForm />
            </div>
        </div>
    );
}
