"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationDropdown from "@/components/common/NotificationDropdown";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const getNavLinks = () => {
        const baseLinks = [
            { name: "Home", href: "/" },
            { name: "Clubs & Societies", href: "/clubs" },
        ];

        if (!mounted || !user) return baseLinks;

        switch (user.role) {
            case "admin":
            case "mainAdmin":
                return [
                    ...baseLinks,
                ];
            case "club":
                return [
                    ...baseLinks,
                ];
            case "student":
            default:
                return [
                    ...baseLinks,
                    { name: "My Profile", href: "/student-profile" },
                ];
        }
    };

    const navLinks = getNavLinks();
    const isAdmin = mounted && user && (user.role === "admin" || user.role === "mainAdmin");
    const isClub = mounted && user && user.role === "club";

    const getProfileHref = () => {
        if (isAdmin) return "/admin-dashboard";
        if (isClub) return "/club-dashboard";
        return "/student-profile";
    };
    const profileHref = getProfileHref();

    return (
        <header
            className={`w-full sticky top-0 z-[100] transition-all duration-300 ${scrolled
                ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-zinc-100"
                : "bg-white border-b border-zinc-200"
                }`}
        >
            <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
                            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(45 12 12)" stroke="currentColor" strokeWidth="1.2" />
                                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-45 12 12)" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-zinc-900 hidden sm:block">
                            Club <span className="text-indigo-600">Sphear</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notification Bell (logged in only) */}
                        {mounted && user && <NotificationDropdown />}

                        {/* Auth/Profile Area */}
                        {mounted && (
                            user ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={profileHref}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 group ${(pathname === "/student-profile" || pathname.startsWith("/admin-dashboard") || pathname.startsWith("/club-dashboard"))
                                            ? "bg-indigo-50"
                                            : "hover:bg-zinc-100"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                                            <span className="text-xs font-bold text-white">
                                                {user.name?.substring(0, 2).toUpperCase() || "US"}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-700 hidden sm:block group-hover:text-zinc-900 max-w-[100px] truncate">
                                            {user.name?.split(" ")[0] || "Profile"}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        href="/auth/register"
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200"
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all duration-200"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )
                        )}

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                            {isMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-zinc-100 bg-white shadow-xl">
                    <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}

                        <div className="mt-3 pt-3 border-t border-zinc-100">
                            {mounted && user ? (
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href={profileHref}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">
                                                {user.name?.substring(0, 2).toUpperCase() || "US"}
                                            </span>
                                        </div>
                                        {user.name || "My Profile"}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/auth/register"
                                        className="py-2.5 text-center rounded-xl text-sm font-bold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-all"
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="py-2.5 text-center rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
