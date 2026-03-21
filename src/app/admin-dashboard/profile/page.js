"use client";

// Feature Domain: The Global Admin System


import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function AdminProfilePage() {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const details = [
        { label: "Email", value: user?.email || "—" },
        { label: "Role", value: user?.role || "admin" },
        { label: "University", value: user?.university || "Not set" },
        { label: "Student ID", value: user?.studentId || "Not set" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold shadow-xl ring-4 ring-white/20 mb-4">
                        {initials}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user?.name || "Admin"}</h2>
                    <p className="text-indigo-100 mt-1 text-sm capitalize">{user?.role || "admin"}</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Detail Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {details.map(({ label, value }) => (
                            <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize break-all">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bio */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Bio</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {user?.bio || <span className="italic text-gray-400">No bio added yet.</span>}
                        </p>
                    </div>

                    {/* Edit Button */}
                    <Link href="/profile/edit" className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
