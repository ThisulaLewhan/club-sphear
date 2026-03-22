"use client";

// Feature Domain: Club Management & Operations

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";

const CATEGORIES = [
    "Technology & Innovation",
    "Academic & Professional",
    "Arts & Humanities",
    "Business & Leadership",
    "Community & Social",
    "Media & Communications",
    "Recreation & Esports",
];

export default function ClubProfilePage() {
    const { user } = useAuth();
    const toast = useToast();

    // Profile state
    const [profile, setProfile] = useState({ clubName: "", category: "", description: "" });
    const [originalProfile, setOriginalProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Password state
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [savingPassword, setSavingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/club-dashboard/profile");
                const data = await res.json();
                if (data.success) {
                    const p = { clubName: data.data.clubName, category: data.data.category, description: data.data.description };
                    setProfile(p);
                    setOriginalProfile(p);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileSave = async () => {
        if (!profile.clubName || profile.clubName.trim().length < 2) {
            toast.error("Club name must be at least 2 characters.");
            return;
        }

        try {
            setSavingProfile(true);
            const res = await fetch("/api/club-dashboard/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully!");
                setOriginalProfile({ ...profile });
                setIsEditing(false);
            } else {
                toast.error(data.error || "Failed to update profile.");
            }
        } catch (err) {
            toast.error("An error occurred while saving.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        setProfile({ ...originalProfile });
        setIsEditing(false);
    };

    const handlePasswordChange = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwords;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            setSavingPassword(true);
            const res = await fetch("/api/club-dashboard/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(passwords),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Password changed successfully!");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.error || "Failed to change password.");
            }
        } catch (err) {
            toast.error("An error occurred while changing the password.");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Club Profile</h1>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold shadow-xl ring-4 ring-white/20 mb-4">
                        {initials}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{profile.clubName || user?.name || "Club"}</h2>
                    <p className="text-emerald-100 mt-1 text-sm">Club Account</p>
                </div>

                {/* Profile Details */}
                <div className="p-6 sm:p-8">
                    {loadingProfile ? (
                        <div className="text-center py-8 text-slate-400 animate-pulse">Loading profile...</div>
                    ) : (
                        <div className="space-y-5">
                            {/* Email (read-only) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                    {user?.email || "—"}
                                </div>
                            </div>

                            {/* Club Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Club Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.clubName}
                                        onChange={(e) => setProfile({ ...profile, clubName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Enter club name"
                                    />
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-800">
                                        {profile.clubName || "—"}
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                                {isEditing ? (
                                    <select
                                        value={profile.category}
                                        onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800">
                                        {profile.category || "—"}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                                {isEditing ? (
                                    <textarea
                                        value={profile.description}
                                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                        placeholder="Describe your club..."
                                    />
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 min-h-[60px]">
                                        {profile.description || "No description set."}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={savingProfile}
                                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {savingProfile ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Update your club account password</p>
                    </div>
                </div>
                <div className="p-6 sm:p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showPasswords}
                                onChange={() => setShowPasswords(!showPasswords)}
                                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-500">Show passwords</span>
                        </label>
                        <button
                            onClick={handlePasswordChange}
                            disabled={savingPassword}
                            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {savingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
