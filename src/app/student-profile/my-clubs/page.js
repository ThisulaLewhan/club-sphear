"use client";

// Feature Domain: Student Experience & Public Content

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

const CATEGORY_COLORS = {
    "Technology & Innovation": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "Academic & Professional": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "Arts & Humanities": "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    "Business & Leadership": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    "Community & Social": "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "Media & Communications": "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "Recreation & Esports": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

function getInitials(name = "") {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function MyClubsContent() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/student/my-clubs")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) setClubs(data.data);
                else setError(data.message || "Failed to load clubs.");
            })
            .catch(() => setError("Something went wrong."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-4 sm:px-6 lg:p-10 transition-colors">
            <div className="max-w-5xl mx-auto py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/student-profile"
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Clubs</h1>
                        <p className="text-slate-500 dark:text-zinc-400 mt-0.5 text-sm">Clubs and societies you are a member of</p>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-r-transparent"></span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {!loading && !error && clubs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200 mb-1">No clubs yet</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-xs">You haven't joined any clubs yet. Browse clubs and apply to become a member.</p>
                        <Link
                            href="/clubs"
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            Explore Clubs
                        </Link>
                    </div>
                )}

                {!loading && clubs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {clubs.map((club) => (
                            <Link
                                key={club.clubId}
                                href={`/clubs/${club.clubId}`}
                                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all overflow-hidden flex flex-col"
                            >
                                {/* Logo / Cover area */}
                                <div className="h-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center relative">
                                    {club.logo ? (
                                        <img src={club.logo} alt={club.clubName} className="h-16 w-16 object-contain rounded-xl" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {getInitials(club.clubName)}
                                        </div>
                                    )}
                                    {/* Member badge */}
                                    <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                                        Member
                                    </span>
                                </div>

                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                        {club.clubName}
                                    </h3>
                                    {club.category && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${CATEGORY_COLORS[club.category] || "bg-slate-100 text-slate-600"}`}>
                                            {club.category}
                                        </span>
                                    )}
                                    {club.description && (
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                                            {club.description}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 dark:text-zinc-500">
                                            Joined {new Date(club.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && clubs.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800">
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            Explore more clubs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyClubsPage() {
    return (
        <AuthGuard>
            <MyClubsContent />
        </AuthGuard>
    );
}
