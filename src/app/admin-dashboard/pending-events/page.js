"use client";

// Feature Domain: The Global Admin System


import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import EventCalendar from "@/components/events/EventCalendar";

export default function AdminPendingEventsPage() {
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // --- Preview Panel State ---
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewEvent, setPreviewEvent] = useState(null);
    const [sameDayEvents, setSameDayEvents] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);

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
                // Close panel if the previewed event was just actioned
                if (previewEvent && previewEvent._id === id) {
                    setPreviewOpen(false);
                    setPreviewEvent(null);
                }
                toast.success(`Event ${status} successfully.`);
            } else {
                toast.error(`Failed to ${status} event`);
            }
        } catch (err) {
            toast.error("Network error updating status");
        } finally {
            setActionLoading(null);
        }
    };

    // --- View Current Listings Logic ---
    const viewCurrentListings = useCallback(async (event) => {
        setPreviewEvent(event);
        setPreviewOpen(true);
        setPreviewLoading(true);
        setSameDayEvents([]);

        try {
            // Determine the relevant date for this pending event
            const targetDate = event.pendingEdit ? event.pendingEdit.date : event.date;
            const targetDay = new Date(targetDate).toDateString();

            const res = await fetch("/api/events?status=approved");
            const json = await res.json();

            if (json.success) {
                // Filter to approved events on the same calendar day
                const filtered = json.data.filter(e => {
                    return new Date(e.date).toDateString() === targetDay;
                });
                // Sort by start time
                filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setSameDayEvents(filtered);
            } else {
                toast.error("Could not load current listings.");
            }
        } catch {
            toast.error("Network error loading listings.");
        } finally {
            setPreviewLoading(false);
        }
    }, [toast]);

    const formatDate = (dateString, startTime) => {
        try {
            const date = new Date(dateString);
            return `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${startTime}`;
        } catch {
            return `${dateString} ${startTime}`;
        }
    };

    const formatDateOnly = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Events</h1>
                    <p className="text-slate-500 mt-1">Review and approve pending club events</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col animate-pulse">
                            <div className="flex-grow">
                                <div className="flex items-start justify-between mb-4 gap-4">
                                    <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
                                    <div className="h-6 bg-slate-200 rounded-full w-20 flex-shrink-0"></div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    </div>
                                </div>

                                <div className="mb-6 p-4 bg-slate-50 rounded-xl space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                </div>
                            </div>
                            <div className="flex sm:flex-row flex-col gap-3 pt-6 border-t border-slate-100">
                                <div className="flex-1 h-11 bg-slate-200 rounded-xl"></div>
                                <div className="flex-1 h-11 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center">
                    {error}
                    <button onClick={fetchPendingEvents} className="ml-4 font-bold underline hover:no-underline">Retry</button>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 tracking-tight">All Caught Up!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">There are no pending events requiring administrative review at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-slate-300">
                            {event.pendingEdit ? (
                                // --- EDIT REVIEW CARD ---
                                <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{event.pendingEdit.title}</h3>
                                            {event.title !== event.pendingEdit.title && (
                                                <span className="text-xs text-slate-500 line-through">was: {event.title}</span>
                                            )}
                                        </div>
                                        <span className="px-3 py-1 bg-blue-50 border border-blue-200/50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0">Edit Pending</span>
                                    </div>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-col text-sm border-l-2 border-blue-200 pl-3">
                                            <div className="flex items-center text-slate-600">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                <span className="font-semibold text-slate-700">{formatDate(event.pendingEdit.date, event.pendingEdit.startTime)} &rarr; {event.pendingEdit.endTime}</span>
                                            </div>
                                            {(formatDate(event.date, event.startTime) !== formatDate(event.pendingEdit.date, event.pendingEdit.startTime) || event.endTime !== event.pendingEdit.endTime) && (
                                                <div className="text-xs text-slate-500 line-through mt-0.5 ml-6">was: {formatDate(event.date, event.startTime)} &rarr; {event.endTime}</div>
                                            )}
                                        </div>

                                        <div className="flex flex-col text-sm border-l-2 border-blue-200 pl-3">
                                            <div className="flex items-center text-slate-600">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                <span className="font-semibold text-slate-700">{event.pendingEdit.venue}</span>
                                            </div>
                                            {event.venue !== event.pendingEdit.venue && (
                                                <div className="text-xs text-slate-500 line-through mt-0.5 ml-6">was: {event.venue}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {event.pendingEdit.description && (
                                        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
                                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.pendingEdit.description}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // --- REGULAR NEW EVENT APPROVAL CARD ---
                                <div className="flex-grow">
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{event.title}</h3>
                                        <span className="px-3 py-1 bg-amber-50 border border-amber-200/50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0">Pending</span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <svg className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <span className="font-semibold text-slate-700">{formatDate(event.date, event.startTime)}</span>
                                            <span className="mx-2 text-slate-300">&rarr;</span>
                                            <span className="font-semibold text-slate-700">{event.endTime}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <svg className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            <span className="font-semibold text-slate-700">{event.venue}</span>
                                        </div>
                                        {event.clubId?.name && (
                                            <div className="flex items-center text-slate-600 text-sm">
                                                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                <span className="font-semibold text-slate-700">{event.clubId.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {event.description && (
                                        <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View Current Listings Button */}
                            <button
                                onClick={() => viewCurrentListings(event)}
                                className="w-full mb-4 py-2.5 px-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 text-indigo-700 font-semibold rounded-xl transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                View Current Listings for This Date
                            </button>

                            <div className="flex sm:flex-row flex-col gap-3 pt-4 border-t border-slate-100">
                                <button
                                    disabled={actionLoading === event._id}
                                    onClick={() => handleAction(event._id, "rejected")}
                                    className="flex-1 py-2.5 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                                >
                                    Reject {event.pendingEdit ? "Edit" : ""}
                                </button>
                                <button
                                    disabled={actionLoading === event._id}
                                    onClick={() => handleAction(event._id, "approved")}
                                    className={`flex-1 py-2.5 px-4 ${event.pendingEdit ? "bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700" : "bg-slate-900 border-slate-900 hover:bg-slate-800 hover:border-slate-800"} border-2 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50`}
                                >
                                    {actionLoading === event._id ? "Processing..." : (event.pendingEdit ? "Approve Edit" : "Approve Event")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ====== APPROVED EVENTS CALENDAR ====== */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Approved Events Calendar</h2>
                        <p className="text-sm text-slate-500">Currently approved events, click any event for details</p>
                    </div>
                </div>
                <EventCalendar />
            </div>

            {/* ====== SLIDE-OVER SIDE PANEL ====== */}
            {/* Backdrop */}
            <div
                className={`fixed top-16 inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${previewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setPreviewOpen(false)}
            />

            {/* Panel */}
            <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${previewOpen ? "translate-x-0" : "translate-x-full"}`}>
                {/* Panel Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/80">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Current Calendar Listings</h2>
                        {previewEvent && (
                            <p className="text-sm text-slate-500 mt-0.5">
                                {formatDateOnly(previewEvent.pendingEdit ? previewEvent.pendingEdit.date : previewEvent.date)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors mt-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Pending Event Summary — prominent card */}
                {previewEvent && (
                    <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Selected Pending Event</p>
                        <div className="bg-white rounded-xl border border-indigo-200/60 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="font-black text-slate-900 text-base leading-tight">
                                    {previewEvent.pendingEdit ? previewEvent.pendingEdit.title : previewEvent.title}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${
                                    previewEvent.pendingEdit
                                        ? "bg-blue-50 border border-blue-200/50 text-blue-700"
                                        : "bg-amber-50 border border-amber-200/50 text-amber-700"
                                }`}>
                                    {previewEvent.pendingEdit ? "Edit" : "Pending"}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-semibold">
                                        {previewEvent.pendingEdit ? `${previewEvent.pendingEdit.startTime} – ${previewEvent.pendingEdit.endTime}` : `${previewEvent.startTime} – ${previewEvent.endTime}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>{previewEvent.pendingEdit ? previewEvent.pendingEdit.venue : previewEvent.venue}</span>
                                </div>
                                {previewEvent.clubId?.name && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <span>{previewEvent.clubId.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Listings Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {previewLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : sameDayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">Date is Clear!</h3>
                            <p className="text-slate-500 text-sm max-w-[220px]">No approved events are currently scheduled for this date.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-semibold text-slate-500 mb-1">
                                {sameDayEvents.length} approved event{sameDayEvents.length > 1 ? "s" : ""} on this date
                            </p>
                            {sameDayEvents.map((e) => (
                                <div key={e._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{e.title}</h4>
                                        <span className="px-2 py-0.5 bg-green-50 border border-green-200/50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0">Approved</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="font-semibold">{e.startTime} – {e.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            <span>{e.venue}</span>
                                        </div>
                                        {e.clubId?.name && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                <span>{e.clubId.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/80">
                    <button
                        onClick={() => setPreviewOpen(false)}
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                        Close Panel
                    </button>
                </div>
            </div>
        </div>
    );
}
