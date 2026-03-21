// old profile edit page

"use client";

import ProfileForm from "@/components/auth/ProfileForm";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

function EditContent() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Club Sphear
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium transition-colors">
              ← Back to Profile
            </Link>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <ProfileForm />
      </main>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <AuthGuard>
      <EditContent />
    </AuthGuard>
  );
}
