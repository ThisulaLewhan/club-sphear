"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ClubsPage() {
    const dummyClubs = [
        { id: "ieee", name: "IEEE", category: "Technology & Innovation", image: "/images/logo-bar/IEEE.png", cover: "bg-gradient-to-tr from-blue-600 to-indigo-600", description: "The Institute of Electrical and Electronics Engineers." },
        { id: "aiesec", name: "AIESEC", category: "Community & Social", image: "/images/logo-bar/aiesec.png", cover: "bg-gradient-to-tr from-blue-400 to-blue-600", description: "A globally recognized youth-led organization." },
        { id: "architecture-club", name: "Architecture Club", category: "Arts & Humanities", image: "/images/logo-bar/architecture.png", cover: "bg-gradient-to-tr from-stone-500 to-stone-700", description: "A creative space for students passionate about building design." },
        { id: "engineering-society", name: "Engineering Society", category: "Academic & Professional", image: "/images/logo-bar/engineering.png", cover: "bg-gradient-to-tr from-emerald-500 to-teal-700", description: "Connecting engineering students across disciplines." },
        { id: "fcsc", name: "FCSC", category: "Technology & Innovation", image: "/images/logo-bar/fcsc.png", cover: "bg-gradient-to-tr from-indigo-500 to-purple-600", description: "Faculty of Computing Student Community." },
        { id: "gaming-club", name: "Gaming Club", category: "Recreation & Esports", image: "/images/logo-bar/gaming.png", cover: "bg-gradient-to-tr from-violet-500 to-fuchsia-600", description: "For casual and competitive gamers alike!" },
        { id: "gavel-club", name: "Gavel Club", category: "Business & Leadership", image: "/images/logo-bar/gavel.png", cover: "bg-gradient-to-tr from-red-500 to-rose-700", description: "An affiliate of Toastmasters International." },
        { id: "humanities-society", name: "Humanities Society", category: "Arts & Humanities", image: "/images/logo-bar/humanities.png", cover: "bg-gradient-to-tr from-amber-500 to-orange-600", description: "Connecting thinkers, writers, and artists." },
        { id: "leo-club", name: "Leo Club", category: "Community & Social", image: "/images/logo-bar/leo.png", cover: "bg-gradient-to-tr from-yellow-400 to-yellow-600", description: "Leadership, Experience, Opportunity." },
        { id: "media-unit", name: "Media Unit", category: "Media & Communications", image: "/images/logo-bar/mediaunit.png", cover: "bg-gradient-to-tr from-sky-400 to-blue-600", description: "The official broadcasting and media coverage team." },
        { id: "rotaract", name: "Rotaract", category: "Community & Social", image: "/images/logo-bar/rotract.png", cover: "bg-gradient-to-tr from-pink-500 to-rose-600", description: "Rotaract brings together people to exchange ideas." },
        { id: "sbsc", name: "SBSC", category: "Business & Leadership", image: "/images/logo-bar/sbsc.png", cover: "bg-gradient-to-tr from-cyan-500 to-cyan-700", description: "SLIIT Business School Student Community." },
        { id: "seds", name: "SEDS", category: "Technology & Innovation", image: "/images/logo-bar/seds.PNG", cover: "bg-gradient-to-tr from-slate-700 to-slate-900", description: "Students for the Exploration and Development of Space." },
        { id: "student-interactive", name: "Student Interactive", category: "Community & Social", image: "/images/logo-bar/student interactive.png", cover: "bg-gradient-to-tr from-purple-500 to-indigo-600", description: "The central student interactive society." },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");

    const filteredClubs = dummyClubs.filter(club => {
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
                    <option>All Categories</option>
                    <option>Technology &amp; Innovation</option>
                    <option>Academic &amp; Professional</option>
                    <option>Arts &amp; Humanities</option>
                    <option>Business &amp; Leadership</option>
                    <option>Community &amp; Social</option>
                    <option>Media &amp; Communications</option>
                    <option>Recreation &amp; Esports</option>
                </select>
            </div>

            {/* Clubs Grid */}
            {filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClubs.map((club, idx) => (
                        <Link href={`/clubs/${club.id}`} key={idx} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer flex flex-col">
                            <div className={`h-32 w-full ${club.cover} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{club.name}</h3>
                                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                                            {club.category}
                                        </span>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-white -mt-10 bg-white flex items-center justify-center font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden relative">
                                        {club.image ? (
                                            <Image src={club.image} alt={club.name} fill className="object-contain p-2" sizes="64px" />
                                        ) : (
                                            <span className="text-zinc-400">{club.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-500 mb-6 flex-1">
                                    A community of students interested in {club.category.toLowerCase()} activities and events.
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
