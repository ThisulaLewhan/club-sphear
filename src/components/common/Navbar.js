"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationDropdown from "@/components/common/NotificationDropdown";

export default function Navbar({ searchQuery, setSearchQuery }) {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Navigation links based on user role
    const getNavLinks = () => {
        const baseLinks = [
            { name: "Home", href: "/" },
            { name: "Clubs & Societies", href: "/clubs" },
        ];

        if (!user) {
            return [
                ...baseLinks,
                { name: "Login", href: "/auth/login" },
                { name: "Register", href: "/auth/register" },
            ];
        }

        switch (user.role) {
            case "admin":
            case "mainAdmin":
                return [
                    ...baseLinks,
                    { name: "Dashboard", href: "/admin-dashboard" },
                    { name: "Pending Events", href: "/admin/events/pending" },
                ];
            case "club":
                return [
                    ...baseLinks,
                    { name: "Create Event", href: "/events/new" },
                    { name: "My Club", href: `/club-profile/${user.id || user.userId}` },
                ];
            case "student":
            default:
                return [
                    ...baseLinks,
                    { name: "Profile", href: "/profile" },
                ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 p-4 sticky top-0 z-40 transition-all">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">

                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-3 font-bold text-xl group cursor-pointer shrink-0">
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
                </Link>

                {/* Center: Search Bar */}
                {setSearchQuery && (
                    <div className="flex-1 max-w-xl hidden md:block mx-4">
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within/search:text-indigo-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery || ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clubs, events, or people..."
                                className="w-full bg-zinc-100 border border-transparent text-zinc-900 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                {/* Right: Navigation & Actions */}
                <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-6 shrink-0">
                    <nav className="text-sm font-semibold hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-zinc-500 hover:text-indigo-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        {user && <NotificationDropdown />}

                        {/* User Profile / Action Button */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-zinc-200">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link href={(user.role === 'admin' || user.role === 'mainAdmin') ? '/admin-profile' : '/profile'} className="flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:shadow-md hover:shadow-indigo-500/20 transition-all">
                                        <div className="w-9 h-9 rounded-full bg-white border-2 border-transparent overflow-hidden flex items-center justify-center">
                                            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-500">
                                                {user.name?.substring(0, 2).toUpperCase() || "US"}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="hidden md:block text-xs font-bold text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="hidden sm:block text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    SIGN IN
                                </Link>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                {isMenuOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-xl animate-fade-in-down">
                    <nav className="flex flex-col p-4 gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="p-3 text-zinc-600 font-semibold hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user && (
                            <button
                                onClick={() => {
                                    logout();
                                    setIsMenuOpen(false);
                                }}
                                className="p-3 text-left text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all mt-2 border-t border-zinc-100"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
