// edit student profile page

"use client";

import ProfileForm from "@/components/auth/ProfileForm";
import AuthGuard from "@/components/auth/AuthGuard";

function EditContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <ProfileForm />
      </main>
    </div>
  );
}

export default function StudentProfileEditPage() {
  return (
    <AuthGuard>
      <EditContent />
    </AuthGuard>
  );
}
