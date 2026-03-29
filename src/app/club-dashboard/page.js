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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Link href="/club-dashboard/events" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><line x1="12" x2="12" y1="14" y2="18" /><line x1="10" x2="14" y1="16" y2="16" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Create Event</h3>
                            <p className="text-sm text-slate-500">Submit a new event for admin approval</p>
                        </div>
                    </div>
                    <span className="text-sm text-emerald-600 font-semibold group-hover:underline">Create new event →</span>
                </Link>

                <Link href="/club-dashboard/profile" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Club Profile</h3>
                            <p className="text-sm text-slate-500">View and manage your club details</p>
                        </div>
                    </div>
                    <span className="text-sm text-purple-600 font-semibold group-hover:underline">View profile →</span>
                </Link>
            </div>
        </div>
    );
}
