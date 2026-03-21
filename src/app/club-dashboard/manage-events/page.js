"use client";

// Feature Domain: Club Management & Operations


import { useState, useEffect } from "react";
import Image from "next/image";

export default function ManageEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/club-dashboard/manage-events");
            const data = await res.json();
            if (data.success) {
                setEvents(data.data);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (eventId, eventTitle) => {
        if (!confirm(`Are you sure you want to permanently delete the event "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(eventId);
            const res = await fetch(`/api/club-dashboard/manage-events/${eventId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                setEvents(events.filter(e => e.id !== eventId));
            } else {
                alert(data.error || "Failed to delete event");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while deleting the event.");
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "approved":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "rejected":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-amber-100 text-amber-700 border-amber-200"; // pending
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            // "14:30" => "2:30 PM"
            const [hours, minutes] = timeString.split(":");
            const date = new Date(2000, 0, 1, hours, minutes);
            return date.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Manage Events</h1>
                <p className="text-slate-600 text-base">View your club's submitted events, check their approval status, and remove unneeded events.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Event Details</th>
                                <th className="px-6 py-4 hidden md:table-cell">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse flex flex-col items-center gap-2">
                                            <div className="h-6 w-6 border-2 border-indigo-500 border-b-transparent rounded-full animate-spin"></div>
                                            Loading events...
                                        </div>
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700 mb-1">No Events Found</h3>
                                            <p className="text-slate-500 text-sm max-w-sm">Your club has not created any events yet. Head over to Create Event to get started!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
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
                                                <span className="font-semibold text-slate-700 mb-0.5">
                                                    {event.date ? new Date(event.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown"}
                                                </span>
                                                <span className="text-slate-500 text-xs">
                                                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${getStatusStyle(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(event.id, event.title)}
                                                disabled={deletingId === event.id}
                                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === event.id
                                                        ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                        : "text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600"
                                                    }`}
                                            >
                                                {deletingId === event.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
