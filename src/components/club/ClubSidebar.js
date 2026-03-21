"use client";

// Feature Domain: Club Management & Operations


import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
    Dashboard: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
    "Create Event": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><line x1="12" x2="12" y1="14" y2="18" /><line x1="10" x2="14" y1="16" y2="16" /></svg>
    ),
    "Manage Events": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="m9 16 2 2 4-4" /></svg>
    ),
    "Create Post": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
    ),
    "Create Notice": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" x2="12" y1="12" y2="18" /><line x1="9" x2="15" y1="15" y2="15" /></svg>
    ),
    "Manage Posts": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h12" /></svg>
    ),
    "Manage Notices": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
    ),
    "Club Profile": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
};

export default function ClubSidebar({ clubName }) {
    const pathname = usePathname();

    const navLinks = [
        { name: "Dashboard", href: "/club-dashboard" },
        { name: "Create Event", href: "/club-dashboard/create-event" },
        { name: "Manage Events", href: "/club-dashboard/manage-events" },
        { name: "Create Post", href: "/club-dashboard/create-post" },
        { name: "Manage Posts", href: "/club-dashboard/manage-posts" },
        { name: "Create Notice", href: "/club-dashboard/create-notice" },
        { name: "Manage Notices", href: "/club-dashboard/manage-notices" },
        { name: "Club Profile", href: "/club-dashboard/profile" },
    ];

    return (
        <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-y-auto">
            {/* Branding */}
            <div className="px-6 pt-7 pb-5">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">Club Panel</h2>
                        {clubName && <p className="text-xs text-slate-500 truncate max-w-[160px]">{clubName}</p>}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-slate-100"></div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-5 space-y-1">
                <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            <span className={isActive ? "text-emerald-600" : "text-slate-400"}>{icons[link.name]}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 text-center">Club Sphear &middot; Club Panel</p>
            </div>
        </aside>
    );
}
