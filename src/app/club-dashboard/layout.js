"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ClubSidebar from "@/components/club/ClubSidebar";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ClubDashboardLayout({ children }) {
    return (
        <AuthGuard>
            <ClubDashboardContent>{children}</ClubDashboardContent>
        </AuthGuard>
    );
}

function ClubDashboardContent({ children }) {
    const { user } = useAuth();

    // Only allow club role
    if (user && user.role !== "club") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-gray-500">This area is for club accounts only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            <ClubSidebar clubName={user?.name} />
            <main className="flex-1 min-h-screen overflow-y-auto p-6 lg:p-10">
                {children}
            </main>
        </div>
    );
}
