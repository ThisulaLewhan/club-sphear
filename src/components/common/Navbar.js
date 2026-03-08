"use client";

import Link from "next/link";
import NotificationDropdown from "@/components/common/NotificationDropdown";

export default function Navbar({ searchQuery, setSearchQuery }) {
    return (
        <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-40 transition-all">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">

                {/* Left: Logo */}
                <div className="flex items-center gap-3 font-bold text-xl group cursor-pointer shrink-0">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/30 overflow-hidden">
                        <svg
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full text-white mix-blend-overlay opacity-90"
                        >
                            <circle cx="20" cy="20" r="5" fill="currentColor" />
                            <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" />
                            <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(-45 20 20)" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                            <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                            <circle cx="30" cy="30" r="2.5" fill="currentColor" />
                            <circle cx="30" cy="10" r="1.5" fill="currentColor" />
                            <circle cx="10" cy="30" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient font-extrabold tracking-tight hidden sm:block">
                        Club Sphear
                    </span>
                </div>

                {/* Center: Search Bar (Conditionally rendered to avoid breaking pages without search) */}
                {setSearchQuery && (
                    <div className="flex-1 max-w-xl hidden md:block">
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within/search:text-indigo-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery || ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clubs, events, or people..."
                                className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                {/* Right: Navigation & Actions */}
                <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-6 shrink-0">
                    <nav className="text-sm font-semibold hidden lg:flex items-center gap-6 mr-2">
                        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Home</Link>
                        <Link href="/clubs" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Clubs & Societies</Link>
                    </nav>

                    <NotificationDropdown />

                    {/* User Profile / Action Button */}
                    <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-zinc-200 dark:border-zinc-800">
                        <button className="hidden sm:flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:shadow-md hover:shadow-indigo-500/20 transition-all">
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border-2 border-transparent overflow-hidden flex items-center justify-center">
                                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-500">LM</span>
                            </div>
                        </button>

                        <button className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
