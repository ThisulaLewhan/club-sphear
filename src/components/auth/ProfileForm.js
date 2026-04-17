"use client";

// Feature Domain: Authentication & Access Control

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProfileForm() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        university: "",
        studentId: "",
        bio: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Load current profile from API
    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setFormData({
                        name: data.user.name || "",
                        university: data.user.university || "",
                        studentId: data.user.studentId || "",
                        bio: data.user.bio || "",
                    });
                }
            })
            .catch(() => setError("Failed to load profile."))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess("Profile updated successfully!");
                if (typeof refreshUser === "function") refreshUser();
                setTimeout(() => router.push("/student-profile/profile"), 1200);
            } else {
                setError(data.message || "Failed to update profile.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-r-transparent" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edit Profile</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Update your personal information below.</p>
            </div>

            {/* Success */}
            {success && (
                <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                    {success}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="pf-name" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="pf-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* University */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="pf-university" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        University
                    </label>
                    <input
                        id="pf-university"
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="e.g. SLIIT"
                        className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Student ID — read-only since it's derived from email */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="pf-student-id" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Student ID
                    </label>
                    <input
                        id="pf-student-id"
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        readOnly
                        className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 dark:text-zinc-500">Derived from your university email — cannot be changed.</p>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="pf-bio" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Bio
                    </label>
                    <textarea
                        id="pf-bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        maxLength={300}
                        placeholder="Tell us a bit about yourself…"
                        className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
                    />
                    <p className="text-xs text-slate-400 dark:text-zinc-500 text-right">{formData.bio.length}/300</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2 min-w-[130px] justify-center"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                Saving…
                            </>
                        ) : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
