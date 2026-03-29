"use client";

// Feature Domain: The Global Admin System


import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingEvents: "—",
    activeClubs: "—",
    totalMembers: "—",
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats({
              pendingEvents: data.pendingEvents ?? 0,
              activeClubs: data.activeClubs ?? 0,
              totalMembers: data.totalMembers ?? 0,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  const statCards = [
    { label: "Pending Events", value: stats.pendingEvents, color: "from-amber-500 to-orange-500", href: "/admin-dashboard/pending-events" },
    ...(user?.role === "mainAdmin" ? [
      { label: "Active Clubs", value: stats.activeClubs, color: "from-emerald-500 to-teal-500", href: "/admin-dashboard/clubs" },
      { label: "Total Members", value: stats.totalMembers, color: "from-blue-500 to-indigo-500", href: "/admin-dashboard/members" },
    ] : []),
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back, <span className="font-semibold text-slate-700">{user?.name || "Admin"}</span>. You are logged in as{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {user?.role === "mainAdmin" ? "Main Admin" : "Admin"}
          </span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} rounded-full -translate-y-8 translate-x-8 opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === "mainAdmin" && (
          <>
            <Link href="/admin-dashboard/admins" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Admins</h3>
            </Link>

            <Link href="/admin-dashboard/clubs" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Clubs</h3>
            </Link>
          </>
        )}

        <Link href="/admin-dashboard/messages" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5h11C20 5 22 7 22 9.5Z" /><polyline points="6 12 10 16 18 8" /></svg>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Messages</h3>
        </Link>

        <Link href="/admin-dashboard/profile" className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">My Profile</h3>
        </Link>
      </div>
    </div>
  );
}
