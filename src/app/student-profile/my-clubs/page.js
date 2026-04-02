"use client";

// Feature Domain: Student Experience & Public Content

import { useState, useEffect, useRef } from "react";
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

const CATEGORY_ICONS = {
    "Technology & Innovation": "💻",
    "Academic & Professional": "📚",
    "Arts & Humanities": "🎨",
    "Business & Leadership": "💼",
    "Community & Social": "🤝",
    "Media & Communications": "📢",
    "Recreation & Esports": "🎮",
};

function getInitials(name = "") {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarGradient(name = "") {
    const gradients = [
        "from-indigo-500 to-purple-600",
        "from-blue-500 to-cyan-600",
        "from-emerald-500 to-teal-600",
        "from-orange-500 to-red-500",
        "from-pink-500 to-rose-600",
        "from-violet-500 to-indigo-600",
        "from-amber-500 to-orange-600",
    ];
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
}

function ClubCard({ club }) {
    return (
        <Link
            href={`/clubs/${club.clubId}`}
            className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 overflow-hidden flex flex-col"
        >
            {/* Logo / Cover area */}
            <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-900/20 dark:to-purple-900/20" />
                {club.logo ? (
                    <img src={club.logo} alt={club.clubName} className="h-16 w-16 object-contain rounded-xl relative z-10 shadow-md" />
                ) : (
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(club.clubName)} flex items-center justify-center text-white text-2xl font-bold shadow-md relative z-10`}>
                        {getInitials(club.clubName)}
                    </div>
                )}
                {/* Member badge */}
                <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                    Member
                </span>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                    {club.clubName}
                </h3>
                {club.category && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full w-fit ${CATEGORY_COLORS[club.category] || "bg-slate-100 text-slate-600"}`}>
                        {CATEGORY_ICONS[club.category]} {club.category}
                    </span>
                )}
                {club.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mt-0.5">
                        {club.description}
                    </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50 dark:border-zinc-800">
                    <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        Joined {new Date(club.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
            </div>
        </Link>
    );
}

function MyClubsContent() {
    const [clubs, setClubs] = useState([]);
    const [allClubs, setAllClubs] = useState([]);   // all DB clubs for suggestions
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fetch joined clubs + all clubs for suggestions
    useEffect(() => {
        Promise.all([
            fetch("/api/student/my-clubs").then((r) => r.json()),
            fetch("/api/clubs").then((r) => r.json()),
        ])
            .then(([myData, allData]) => {
                if (myData.success) setClubs(myData.data);
                else setError(myData.message || "Failed to load clubs.");
                if (allData.success) setAllClubs(allData.data);
            })
            .catch(() => setError("Something went wrong."))
            .finally(() => setLoading(false));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                searchRef.current && !searchRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const joinedIds = new Set(clubs.map((c) => c.clubId));

    // Suggestions: all DB clubs matching search query
    const suggestions = search.trim().length > 0
        ? allClubs.filter((c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              (c.category || "").toLowerCase().includes(search.toLowerCase())
          ).slice(0, 6)
        : [];

    // Filter joined clubs by search text
    const filteredClubs = clubs.filter((c) =>
        search.trim() === "" ||
        c.clubName.toLowerCase().includes(search.toLowerCase()) ||
        (c.category || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase())
    );

    const clearSearch = () => {
        setSearch("");
        setShowSuggestions(false);
        searchRef.current?.focus();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            {/* Top header bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <Link
                        href="/student-profile"
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Clubs</h1>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                            {loading ? "Loading…" : `${clubs.length} club${clubs.length !== 1 ? "s" : ""} joined`}
                        </p>
                    </div>
                    <Link
                        href="/clubs"
                        className="shrink-0 hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        Explore Clubs
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Search bar */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        ref={searchRef}
                        className={`flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${showSuggestions && suggestions.length > 0 ? "border-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-zinc-500 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => search.trim().length > 0 && setShowSuggestions(true)}
                            placeholder="Search clubs by name or category…"
                            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                        />
                        {search && (
                            <button onClick={clearSearch} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 z-30 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800">
                                <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Clubs from database</p>
                            </div>
                            {suggestions.map((club) => {
                                const isMember = joinedIds.has(club.id);
                                return (
                                    <Link
                                        key={club.id}
                                        href={`/clubs/${club.id}`}
                                        onClick={() => setShowSuggestions(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(club.name)} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
                                            {getInitials(club.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">{club.name}</p>
                                            {club.category && (
                                                <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{club.category}</p>
                                            )}
                                        </div>
                                        {isMember ? (
                                            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Member</span>
                                        ) : (
                                            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">View</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>


                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-r-transparent"></span>
                        <p className="text-sm text-slate-400 dark:text-zinc-500">Loading your clubs…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        {error}
                    </div>
                )}

                {/* No clubs joined at all */}
                {!loading && !error && clubs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-5 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-200 mb-2">No clubs yet</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">You haven't joined any clubs yet. Browse and apply to become a member.</p>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            Explore Clubs
                        </Link>
                    </div>
                )}

                {/* Search returns no results within joined clubs */}
                {!loading && clubs.length > 0 && filteredClubs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        </div>
                        <p className="text-base font-semibold text-slate-600 dark:text-zinc-300 mb-1">No matches in your clubs</p>
                        <p className="text-sm text-slate-400 dark:text-zinc-500 mb-4">
                            {search ? `No club named "${search}" in your memberships.` : `No clubs in this category.`}
                        </p>
                        {search && suggestions.length > 0 && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400">Check the suggestions above to explore matching clubs.</p>
                        )}
                        <button
                            onClick={() => setSearch("")}
                            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Club grid */}
                {!loading && filteredClubs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredClubs.map((club) => (
                            <ClubCard key={club.clubId} club={club} />
                        ))}
                    </div>
                )}

                {/* Showing count when search is active */}
                {!loading && clubs.length > 0 && filteredClubs.length !== clubs.length && (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 text-right">
                        Showing {filteredClubs.length} of {clubs.length}
                    </p>
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
