"use client";

// Feature Domain: Student Experience & Public Content


import Link from "next/link";
import { useState, useEffect } from "react";

const CATEGORIES = [
    "All Categories",
    "Technology & Innovation",
    "Academic & Professional",
    "Arts & Humanities",
    "Business & Leadership",
    "Community & Social",
    "Media & Communications",
    "Recreation & Esports",
];

const CATEGORY_COLORS = {
    "Technology & Innovation": "bg-gradient-to-tr from-blue-600 to-indigo-600",
    "Academic & Professional": "bg-gradient-to-tr from-emerald-500 to-teal-700",
    "Arts & Humanities": "bg-gradient-to-tr from-amber-500 to-orange-600",
    "Business & Leadership": "bg-gradient-to-tr from-red-500 to-rose-700",
    "Community & Social": "bg-gradient-to-tr from-pink-500 to-rose-600",
    "Media & Communications": "bg-gradient-to-tr from-sky-400 to-blue-600",
    "Recreation & Esports": "bg-gradient-to-tr from-violet-500 to-fuchsia-600",
};

export default function ClubsPage() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");

    useEffect(() => {
        async function fetchClubs() {
            try {
                const res = await fetch("/api/clubs");
                const data = await res.json();
                if (data.success) {
                    setClubs(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch clubs:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchClubs();
    }, []);

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "All Categories" || club.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Explore Clubs &amp; Societies</h1>
                <p className="text-zinc-600 text-lg">Discover and join student organizations that match your interests.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search clubs by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 max-w-md bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden animate-pulse">
                            <div className="h-32 bg-zinc-200"></div>
                            <div className="p-6">
                                <div className="h-5 bg-zinc-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-zinc-100 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-zinc-100 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClubs.map((club) => (
                        <Link href={`/clubs/${club.id}`} key={club.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer flex flex-col">
                            <div className={`h-32 w-full ${CATEGORY_COLORS[club.category] || "bg-gradient-to-tr from-slate-500 to-slate-700"} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{club.name}</h3>
                                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                                            {club.category}
                                        </span>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-white -mt-10 bg-white flex items-center justify-center font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden">
                                        <span className="text-indigo-500 text-xl font-extrabold">{club.name.charAt(0)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-500 mb-6 flex-1">
                                    {club.description || `A community of students interested in ${club.category.toLowerCase()} activities and events.`}
                                </p>
                                <div className="flex items-center justify-end pt-4 border-t border-zinc-100">
                                    <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                                        View Details &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="w-full py-16 text-center bg-white rounded-2xl border border-zinc-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-zinc-300 mb-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <h3 className="text-xl font-bold text-zinc-700 mb-2">No clubs found</h3>
                    <p className="text-zinc-500">We couldn&apos;t find any clubs matching your search criteria.</p>
                    <button
                        onClick={() => { setSearchQuery(""); setCategoryFilter("All Categories"); }}
                        className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
