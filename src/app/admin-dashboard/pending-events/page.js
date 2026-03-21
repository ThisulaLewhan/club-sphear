"use client";

import { useEffect, useState } from "react";

export default function AdminPendingEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/events?status=pending");
            const json = await res.json();
            if (json.success) {
                setEvents(json.data);
            } else {
                setError(json.error || "Failed to load pending events");
            }
        } catch (err) {
            setError("Network error fetching events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleAction = async (id, status) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/events/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setEvents(prev => prev.filter(e => e._id !== id));
            } else {
                alert(`Failed to ${status} event`);
            }
        } catch (err) {
            alert("Network error updating status");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString, startTime) => {
        try {
            const date = new Date(dateString);
            return `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${startTime}`;
        } catch {
            return `${dateString} ${startTime}`;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Pending Events</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Review and approve pending club events</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl animate-pulse">
                            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-6"></div>
                            <div className="flex gap-2">
                                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded flex-grow"></div>
                                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded flex-grow"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-500/20 text-center">
                    {error}
                    <button onClick={fetchPendingEvents} className="ml-4 font-bold underline hover:no-underline">Retry</button>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">All Caught Up!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">There are no pending events requiring administrative review at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
                            <div className="flex-grow">
                                <div className="flex items-start justify-between mb-4 gap-4">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">{event.title}</h3>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0">Pending</span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm">
                                        <svg className="w-5 h-5 mr-3 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span className="font-medium">{formatDate(event.date, event.startTime)}</span>
                                        <span className="mx-2 opacity-50">&rarr;</span>
                                        <span className="font-medium">{event.endTime}</span>
                                    </div>
                                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm">
                                        <svg className="w-5 h-5 mr-3 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <span className="font-medium">{event.venue}</span>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{event.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex sm:flex-row flex-col gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                                <button
                                    disabled={actionLoading === event._id}
                                    onClick={() => handleAction(event._id, "rejected")}
                                    className="flex-1 py-2.5 px-4 bg-white dark:bg-black border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    disabled={actionLoading === event._id}
                                    onClick={() => handleAction(event._id, "approved")}
                                    className="flex-1 py-2.5 px-4 bg-green-600 dark:bg-green-600/20 border border-transparent dark:border-green-500/20 text-white dark:text-green-400 font-medium rounded-xl hover:bg-green-700 dark:hover:bg-green-600/30 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {actionLoading === event._id ? "Processing..." : "Approve Event"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
