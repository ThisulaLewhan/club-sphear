"use client";

// Feature Domain: Club Management & Operations

import { useState, useEffect } from "react";
import EventForm from "@/components/events/EventForm";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

// ── Create Event Tab ──────────────────────────────────────────────────────────
function CreateEventTab() {
    return (
        <div className="w-full">
            <EventForm />
        </div>
    );
}

// ── Manage Events Tab ─────────────────────────────────────────────────────────
function ManageEventsTab() {
    const toast = useToast();
    const confirm = useConfirm();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchEvents = async () => {
        try { setLoading(true); const res = await fetch("/api/club-dashboard/manage-events"); const data = await res.json(); if (data.success) setEvents(data.data); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (eventId, eventTitle) => {
        const confirmed = await confirm(`This will permanently delete the event "${eventTitle}". This cannot be undone.`, { title: "Delete Event?", confirmText: "Delete", variant: "danger" });
        if (!confirmed) return;
        try { setDeletingId(eventId); const res = await fetch(`/api/club-dashboard/manage-events/${eventId}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { setEvents(events.filter(e => e.id !== eventId)); toast.success(`Event "${eventTitle}" deleted.`); } else { toast.error(data.error || "Failed to delete event"); } } catch { toast.error("An error occurred."); } finally { setDeletingId(null); }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "rejected": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-amber-100 text-amber-700 border-amber-200";
        }
    };

    const formatTime = (t) => {
        if (!t) return "";
        try { const [h, m] = t.split(":"); return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); } catch { return t; }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Event Details</th>
                            <th className="px-6 py-4 hidden md:table-cell">Date &amp; Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400"><div className="animate-pulse flex flex-col items-center gap-2"><div className="h-6 w-6 border-2 border-indigo-500 border-b-transparent rounded-full animate-spin"></div>Loading events...</div></td></tr>
                        ) : events.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Events Found</h3>
                                    <p className="text-slate-500 text-sm max-w-sm">Switch to Create Event to submit your first event!</p>
                                </div>
                            </td></tr>
                        ) : events.map((event) => (
                            <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-base">{event.title}</span>
                                        <span className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 line-clamp-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                            {event.venue}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700 mb-0.5">{event.date ? new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}</span>
                                        <span className="text-slate-500 text-xs">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${getStatusStyle(event.status)}`}>{event.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(event.id, event.title)} disabled={deletingId === event.id} className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === event.id ? "text-slate-400 bg-slate-100 cursor-not-allowed" : "text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600"}`}>
                                        {deletingId === event.id ? "Deleting..." : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EventsPage() {
    const [tab, setTab] = useState("create");

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Events</h1>
                <p className="text-slate-500 text-base">Create and manage your club&apos;s events.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setTab("create")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "create" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    + Create Event
                </button>
                <button
                    onClick={() => setTab("manage")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "manage" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Manage Events
                </button>
            </div>

            {tab === "create" ? <CreateEventTab /> : <ManageEventsTab />}
        </div>
    );
}
