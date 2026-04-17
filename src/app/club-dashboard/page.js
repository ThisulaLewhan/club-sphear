"use client";

// Feature Domain: Club Management & Operations


import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ClubDashboardOverview() {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Welcome back, <span className="font-semibold text-slate-700">{user?.name || "Club"}</span>
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/club-dashboard/events" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><line x1="12" x2="12" y1="14" y2="18" /><line x1="10" x2="14" y1="16" y2="16" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Events</h3>
                </Link>

                <Link href="/club-dashboard/posts" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Posts</h3>
                </Link>

                <Link href="/club-dashboard/notices" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" x2="12" y1="12" y2="18" /><line x1="9" x2="15" y1="15" y2="15" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Notices</h3>
                </Link>

                <Link href="/club-dashboard/profile" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Club Profile</h3>
                </Link>
            </div>
        </div>
    );
}
