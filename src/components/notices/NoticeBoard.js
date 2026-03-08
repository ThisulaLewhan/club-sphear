"use client";

import { useState, useEffect } from "react";

export default function NoticeBoard({ newNotice, searchQuery = "" }) {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotices = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/notices");

            if (!res.ok) {
                let errMsg = "Failed to fetch notices";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { /* ignore parse error */ }
                throw new Error(errMsg);
            }

            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setNotices(data);
        } catch (err) {
            setError(err.message || "Failed to load notices");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    // Listen for new notices passed down from parents
    useEffect(() => {
        if (newNotice && newNotice._id) {
            setNotices(current => {
                // Prevent duplicates if already in list
                if (current.some(n => n._id === newNotice._id)) return current;
                return [newNotice, ...current];
            });
        }
    }, [newNotice]);

    const prioritizeNotices = (noticeList) => {
        // Sort urgent notices on top
        return [...noticeList].sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
            // Then sort by date
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };

    // Filter notices based on the search query
    const filteredNotices = notices.filter(notice => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (notice.title && notice.title.toLowerCase().includes(q)) ||
            (notice.content && notice.content.toLowerCase().includes(q)) ||
            (notice.club && notice.club.toLowerCase().includes(q))
        );
    });

    const sortedNotices = prioritizeNotices(filteredNotices);

    if (error) {
        return (
            <div className="w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">Unable to load notices.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-full"></div>
                ))}
            </div>
        );
    }

    if (notices.length === 0) {
        return (
            <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                <p>No active notices at the moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    Notice Board
                </h3>
            </div>

            <div className="flex flex-col gap-3">
                {sortedNotices.map((notice) => (
                    <div
                        key={notice._id}
                        className={`relative w-full border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 rounded-r-2xl rounded-l-md border-l-[8px]
                            ${notice.priority === 'urgent'
                                ? 'bg-gradient-to-r from-red-50 to-white dark:from-red-950/30 dark:to-zinc-900 border-red-200 dark:border-red-900/50 border-l-red-500'
                                : 'bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-indigo-500'
                            }`}
                    >
                        {notice.priority === 'urgent' && (
                            <div className="absolute -top-2.5 -right-2.5 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white dark:border-zinc-900"></span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2.5 text-sm font-bold tracking-tight">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white shadow-sm ${notice.priority === 'urgent' ? 'bg-red-500' : 'bg-indigo-600'}`}>
                                    {notice.club.charAt(0)}
                                </div>
                                <span className={`${notice.priority === 'urgent' ? 'text-red-700 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                    {notice.club}
                                </span>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">
                                {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        <h4 className={`font-extrabold text-xl mb-1.5 tracking-tight ${notice.priority === 'urgent' ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
                            {notice.title}
                        </h4>

                        <p className={`text-base leading-relaxed line-clamp-3 ${notice.priority === 'urgent' ? 'text-red-900/80 dark:text-red-200/80' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {notice.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
