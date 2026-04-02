// Feature Domain: Student Experience & Public Content

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import AuthGuard from "@/components/auth/AuthGuard";
import { isValidStudentId } from "@/lib/validations";

function ProfileContent() {
    const { user, updateProfile } = useAuth();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        university: "",
        studentId: "",
        bio: "",
    });

    // Change password state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Populate form data once user is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                university: user.university || "",
                studentId: user.studentId || "",
                bio: user.bio || "",
            });
        }
    }, [user, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async () => {
        if (!formData.name || formData.name.trim().length < 2) {
            toast.error("Name must be at least 2 characters.");
            return;
        }
        if (formData.bio && formData.bio.length > 500) {
            toast.error("Bio must be under 500 characters.");
            return;
        }
        if (formData.studentId && formData.studentId.trim() !== '') {
            if (!isValidStudentId(formData.studentId)) {
                toast.error("Student ID must be in the correct IT12345678 format.");
                return;
            }
        }

        try {
            setSavingProfile(true);
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            } else {
                toast.error(result.message || "Failed to update profile.");
            }
        } catch (err) {
            toast.error("An error occurred while saving.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePasswordSave = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };
        let hasError = false;

        if (!currentPassword) {
            errors.currentPassword = "Current password is required.";
            hasError = true;
        }
        if (!newPassword) {
            errors.newPassword = "New password is required.";
            hasError = true;
        } else if (newPassword === currentPassword) {
            errors.newPassword = "New password cannot be the same as your current password.";
            hasError = true;
        } else if (newPassword.length < 6) {
            errors.newPassword = "Must be at least 6 characters.";
            hasError = true;
        } else if (!/[A-Z]/.test(newPassword)) {
            errors.newPassword = "Must contain at least one uppercase letter.";
            hasError = true;
        } else if (!/[a-z]/.test(newPassword)) {
            errors.newPassword = "Must contain at least one lowercase letter.";
            hasError = true;
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
            errors.newPassword = "Must contain at least one special character.";
            hasError = true;
        }
        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your new password.";
            hasError = true;
        } else if (newPassword && newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
            hasError = true;
        }

        if (hasError) {
            setPasswordErrors(errors);
            return;
        }

        try {
            setSavingPassword(true);
            const res = await fetch("/api/student/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Password changed successfully!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setShowPasswordSection(false);
            } else {
                toast.error(data.error || "Failed to change password.");
            }
        } catch {
            toast.error("An error occurred while changing password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 transition-colors">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Student Profile</h1>

                {/* Profile Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden mb-8 shadow-sm">
                    {/* Header Banner */}
                    <div className="relative px-8 py-10 text-center bg-gradient-to-r from-indigo-500 to-purple-600">
                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className="relative inline-flex mb-4">
                                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold shadow-xl ring-4 ring-white/20 overflow-hidden">
                                    <span>{initials}</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white shadow-black/10 text-shadow">
                                {isEditing ? "Editing Profile" : (user?.name || "Student")}
                            </h2>
                            <p className="text-indigo-100 mt-1 text-sm font-medium">Student Account</p>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-6 sm:p-8">
                        <div className="space-y-5">
                            {/* Email (read-only) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Email</label>
                                <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/50 text-sm text-slate-600 dark:text-zinc-400">
                                    {user?.email || "—"}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/50 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                        {user?.name || "—"}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* University */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">University</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="university"
                                            value={formData.university}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                            placeholder="e.g., SLIIT"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/50 text-sm text-slate-800 dark:text-zinc-200">
                                            {user?.university || "Not set"}
                                        </div>
                                    )}
                                </div>

                                {/* Student ID */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Student ID</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                            placeholder="e.g., IT21000000"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/50 text-sm text-slate-800 dark:text-zinc-200">
                                            {user?.studentId || "Not set"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Bio</label>
                                {isEditing ? (
                                    <>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={3}
                                            maxLength={500}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
                                            placeholder="Tell us about yourself..."
                                        />
                                        <div className="text-right mt-1">
                                            <p className={`text-xs font-medium ${formData.bio.length > 450 ? "text-amber-500" : "text-slate-400 dark:text-zinc-500"}`}>
                                                {formData.bio.length}/500
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/50 text-sm text-slate-600 dark:text-zinc-400 min-h-[60px]">
                                        {user?.bio || <span className="italic text-slate-400 dark:text-zinc-500">No bio added yet. Click &quot;Edit Profile&quot; to add one.</span>}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800 mt-6">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={savingProfile}
                                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {savingProfile ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Password</h3>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Update your account password</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowPasswordSection((v) => !v);
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                setShowPasswords({ current: false, new: false, confirm: false });
                                setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            }}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {showPasswordSection ? "Cancel" : "Change Password"}
                        </button>
                    </div>

                    {showPasswordSection && (
                        <div className="p-6 sm:p-8 space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${passwordErrors.currentPassword ? "border-red-400 focus:ring-red-400" : "border-slate-300 dark:border-zinc-700 focus:ring-indigo-500"}`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                    >
                                        {showPasswords.current ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && <p className="mt-1.5 text-xs text-red-500">{passwordErrors.currentPassword}</p>}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${passwordErrors.newPassword ? "border-red-400 focus:ring-red-400" : "border-slate-300 dark:border-zinc-700 focus:ring-indigo-500"}`}
                                        placeholder="Min 6 chars, upper, lower, special"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                    >
                                        {showPasswords.new ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && <p className="mt-1.5 text-xs text-red-500">{passwordErrors.newPassword}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${passwordErrors.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-slate-300 dark:border-zinc-700 focus:ring-indigo-500"}`}
                                        placeholder="Re-enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                    >
                                        {showPasswords.confirm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handlePasswordSave}
                                    disabled={savingPassword}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {savingPassword ? "Saving..." : "Update Password"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StudentProfilePage() {
    return (
        <AuthGuard>
            <ProfileContent />
        </AuthGuard>
    );
}
