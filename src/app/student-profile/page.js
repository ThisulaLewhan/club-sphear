"use client";

// Feature Domain: Student Experience & Public Content

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthGuard from "@/components/auth/AuthGuard";

function DashboardOverview() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-4 sm:px-6 lg:p-10 transition-colors">
            <div className="max-w-5xl mx-auto py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">
                        Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name || "Student"}</span>
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/clubs" className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col items-center sm:items-start text-center sm:text-left gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">Explore Clubs</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">Browse, discover, and join diverse university communities right on campus.</p>
                        </div>
                    </Link>

                    <Link href="/chat" className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col items-center sm:items-start text-center sm:text-left gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">Q&A</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">Connect and ask questions instantly with clubs and societies on campus.</p>
                        </div>
                    </Link>

                    <Link href="/student-profile/profile" className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex flex-col items-center sm:items-start text-center sm:text-left gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">My Profile</h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">Manage your university details, update your bio, and adjust settings.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboardOverview() {
    return (
        <AuthGuard>
            <DashboardOverview />
        </AuthGuard>
    );
}
