"use client";

// Feature Domain: The Global Admin System


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const icons = {
  Dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
  ),
  "Pending Events": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  "Messages": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5h11C20 5 22 7 22 9.5Z" /><polyline points="6 12 10 16 18 8" /></svg>
  ),
  "Clubs": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
  ),
  "Admins": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
  ),
  "Members": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  "My Profile": (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = mounted && user ? user.role : "";

  const navLinks = [
    { name: "Dashboard", href: "/admin-dashboard", visibleTo: ["mainAdmin", "admin"] },
    { name: "Pending Events", href: "/admin-dashboard/pending-events", visibleTo: ["mainAdmin", "admin"] },
    { name: "Messages", href: "/admin-dashboard/messages", visibleTo: ["mainAdmin", "admin"] },
    { name: "Members", href: "/admin-dashboard/members", visibleTo: ["mainAdmin", "admin"] },
    { name: "Clubs", href: "/admin-dashboard/clubs", visibleTo: ["mainAdmin"] },
    { name: "Admins", href: "/admin-dashboard/admins", visibleTo: ["mainAdmin"] },
    { name: "My Profile", href: "/admin-dashboard/profile", visibleTo: ["mainAdmin", "admin"] },
  ];

  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo / Branding */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Admin Panel</h2>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-slate-100"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
        {navLinks.map((link) => {
          if (!link.visibleTo.includes(userRole)) return null;

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <span className={isActive ? "text-indigo-600" : "text-slate-400"}>{icons[link.name]}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">Club Sphear Admin &middot; v1.0</p>
      </div>
    </aside>
  );
}
