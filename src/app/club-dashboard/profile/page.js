"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function ClubProfilePage() {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const details = [
        { label: "Club Name", value: user?.name || "—" },
        { label: "Email", value: user?.email || "—" },
        { label: "Role", value: "Club" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Club Profile</h1>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold shadow-xl ring-4 ring-white/20 mb-4">
                        {initials}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user?.name || "Club"}</h2>
                    <p className="text-emerald-100 mt-1 text-sm">Club Account</p>
                </div>

                <div className="p-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {details.map(({ label, value }) => (
                            <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                                <p className="text-sm font-semibold text-slate-800 mt-0.5 break-all">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
