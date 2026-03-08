"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ userRole }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/admin-dashboard", visibleTo: ["mainAdmin", "admin"] },
    { name: "Create Admin", href: "/admin-dashboard/create-admin", visibleTo: ["mainAdmin"] },
    { name: "Create Club", href: "/admin-dashboard/create-club", visibleTo: ["mainAdmin"] },
    { name: "My Profile", href: "/admin-profile", visibleTo: ["mainAdmin", "admin"] },
  ];

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-full border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <span className="text-xs text-blue-600 font-semibold bg-blue-100 py-1 px-2 rounded-full mt-2 inline-block">
          {userRole === "mainAdmin" ? "Main Admin" : "Admin"}
        </span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navLinks.map((link) => {
          if (!link.visibleTo.includes(userRole)) return null;

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">Sphear Admin Module</p>
      </div>
    </div>
  );
}
