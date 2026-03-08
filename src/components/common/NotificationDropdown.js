"use client";

import { useState, useRef, useEffect } from "react";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Some dummy upcoming events since we don't have an endpoint for adding events yet
    const upcomingEvents = [
        {
            id: 1,
            title: "Tech Innovators Summit 2026",
            club: "IEEE",
            date: new Date(Date.now() + 86400000 * 2), // 2 days from now
            venue: "Main Auditorium",
        },
        {
            id: 2,
            title: "Annual Charity Bake Sale",
            club: "Rotaract",
            date: new Date(Date.now() + 86400000 * 5), // 5 days from now
            venue: "Student Square",
        },
        {
            id: 3,
            title: "AI & Machine Learning Workshop",
            club: "Mozilla Campus Club",
            date: new Date(Date.now() + 86400000 * 12), // 12 days from now
            venue: "Lab 3, CS Building",
        }
    ];

    // Close the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell */}
            <button
                onClick={toggleDropdown}
                className={`p-2.5 rounded-full transition-colors relative ${isOpen ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                {/* Unread indicator */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Upcoming Events</h3>
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                            {upcomingEvents.length} New
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto w-full">
                        {upcomingEvents.length > 0 ? (
                            <ul className="flex flex-col w-full">
                                {upcomingEvents.map((event) => (
                                    <li key={event.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors w-full cursor-pointer">
                                        <div className="px-4 py-3 flex gap-3">
                                            <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                                <span className="text-xs font-bold text-indigo-500 uppercase">{event.date.toLocaleString('en-US', { month: 'short' })}</span>
                                                <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">{event.date.getDate()}</span>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{event.title}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                                    {event.club}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                                    {event.venue}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming events found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
