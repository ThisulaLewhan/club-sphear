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
      { label: "Active Clubs", value: stats.activeClubs, color: "from-emerald-500 to-teal-500", href: "/admin-dashboard/manage-clubs" },
      { label: "Total Members", value: stats.totalMembers, color: "from-blue-500 to-indigo-500", href: "#" },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {user?.role === "mainAdmin" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Account Management</h3>
                <p className="text-sm text-slate-500">Create new administrator or club accounts</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin-dashboard/create-admin"
                className="flex-1 text-center text-sm bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Create Admin
              </Link>
              <Link
                href="/admin-dashboard/create-club"
                className="flex-1 text-center text-sm bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Create Club
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">My Profile</h3>
              <p className="text-sm text-slate-500">View and manage your account settings</p>
            </div>
          </div>
          <Link
            href="/admin-dashboard/profile"
            className="block text-center text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
