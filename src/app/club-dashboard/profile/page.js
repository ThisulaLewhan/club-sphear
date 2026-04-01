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
    const [profile, setProfile] = useState({ 
        clubName: "", 
        category: "", 
        description: "", 
        logo: "", 
        coverImage: "", 
        executiveBoard: [] 
    });
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
                    const p = { 
                        clubName: data.data.clubName, 
                        category: data.data.category, 
                        description: data.data.description,
                        logo: data.data.logo || "",
                        coverImage: data.data.coverImage || "",
                        executiveBoard: data.data.executiveBoard || []
                    };
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxWidth = 1080;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                setProfile(prev => ({ ...prev, logo: compressedBase64 }));

                const saveImage = async () => {
                    try {
                        const res = await fetch("/api/club-dashboard/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...profile, logo: compressedBase64 }),
                        });
                        const data = await res.json();
                        if (data.success) {
                            toast.success("Profile picture updated!");
                            setOriginalProfile(prev => ({ ...prev, logo: data.data.logo }));
                            setProfile(prev => ({ ...prev, logo: data.data.logo }));
                        } else {
                            toast.error(data.error || "Failed to update profile picture.");
                        }
                    } catch (err) {
                        toast.error("An error occurred while saving the picture.");
                    }
                };
                saveImage();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxWidth = 1920;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                setProfile(prev => ({ ...prev, coverImage: compressedBase64 }));

                const saveImage = async () => {
                    try {
                        const res = await fetch("/api/club-dashboard/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...profile, coverImage: compressedBase64 }),
                        });
                        const data = await res.json();
                        if (data.success) {
                            toast.success("Cover picture updated!");
                            setOriginalProfile(prev => ({ ...prev, coverImage: data.data.coverImage }));
                            setProfile(prev => ({ ...prev, coverImage: data.data.coverImage }));
                        } else {
                            toast.error(data.error || "Failed to update cover picture.");
                        }
                    } catch (err) {
                        toast.error("An error occurred while saving the picture.");
                    }
                };
                saveImage();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

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

    const addBoardMember = () => {
        setProfile(prev => ({
            ...prev,
            executiveBoard: [...prev.executiveBoard, { name: "", role: "" }]
        }));
    };

    const removeBoardMember = (index) => {
        setProfile(prev => ({
            ...prev,
            executiveBoard: prev.executiveBoard.filter((_, i) => i !== index)
        }));
    };

    const updateBoardMember = (index, field, value) => {
        const updatedBoard = [...profile.executiveBoard];
        updatedBoard[index][field] = value;
        setProfile(prev => ({ ...prev, executiveBoard: updatedBoard }));
    };

    // Password strength rules
    const passwordRules = [
        { label: "At least 6 characters", test: (pw) => pw.length >= 6 },
        { label: "One uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
        { label: "One lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
        { label: "One special character (!@#$...)", test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
    ];

    const allRulesPassed = passwords.newPassword && passwordRules.every(rule => rule.test(passwords.newPassword));

    const handlePasswordChange = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwords;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required.");
            return;
        }

        // Validate each rule
        for (const rule of passwordRules) {
            if (!rule.test(newPassword)) {
                toast.error(rule.label + " is required.");
                return;
            }
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
                <div className={`relative px-8 py-10 text-center ${profile.coverImage ? '' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                    {profile.coverImage && (
                        <div className="absolute inset-0 z-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                    )}
                    
                    {/* Cover Image Upload Button */}
                    <label className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-2 rounded-xl cursor-pointer shadow-lg border border-white/30 transition-colors flex items-center gap-2" title="Change Cover Picture">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        <span className="text-xs font-semibold tracking-wide">Change Cover</span>
                        <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleCoverImageChange} />
                    </label>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="relative inline-flex mb-4">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold shadow-xl ring-4 ring-white/20 overflow-hidden">
                                {profile.logo ? (
                                    <img src={profile.logo} alt="Club Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-full cursor-pointer shadow-lg ring-2 ring-emerald-500 transition-colors z-10" title="Change Profile Picture">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                            </label>
                        </div>
                        <h2 className="text-2xl font-bold text-white shadow-black/10 text-shadow">{profile.clubName || user?.name || "Club"}</h2>
                        <p className="text-emerald-100 mt-1 text-sm font-medium">Club Account</p>
                    </div>
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

                            {/* Executive Board */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Executive Board</label>
                                    {isEditing && (
                                        <button
                                            onClick={addBoardMember}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                            Add Member
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {profile.executiveBoard.length > 0 ? (
                                        profile.executiveBoard.map((member, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 relative group">
                                                {isEditing ? (
                                                    <>
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={member.name}
                                                                onChange={(e) => updateBoardMember(index, "name", e.target.value)}
                                                                placeholder="Member Name"
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={member.role}
                                                                onChange={(e) => updateBoardMember(index, "role", e.target.value)}
                                                                placeholder="Position (e.g. President)"
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeBoardMember(index)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit self-end sm:self-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {member.name.charAt(0) || "EX"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                                            <p className="text-xs text-slate-500">{member.role}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic py-2">No board members added.</p>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic">* These members will be displayed on your public club profile.</p>
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
                                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                                    passwords.newPassword
                                        ? allRulesPassed
                                            ? 'border-emerald-400 focus:ring-emerald-500'
                                            : 'border-red-300 focus:ring-red-400'
                                        : 'border-slate-300 focus:ring-amber-500'
                                }`}
                                placeholder="Enter strong password"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                                    passwords.confirmPassword
                                        ? passwords.confirmPassword === passwords.newPassword
                                            ? 'border-emerald-400 focus:ring-emerald-500'
                                            : 'border-red-300 focus:ring-red-400'
                                        : 'border-slate-300 focus:ring-amber-500'
                                }`}
                                placeholder="Re-enter new password"
                            />
                            {passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    {/* Password Strength Rules Checklist */}
                    {passwords.newPassword && (
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Password Requirements</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {passwordRules.map((rule, i) => {
                                    const passed = rule.test(passwords.newPassword);
                                    return (
                                        <div key={i} className={`flex items-center gap-2 text-xs font-medium transition-colors ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {passed ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 shrink-0"><circle cx="12" cy="12" r="10"></circle></svg>
                                            )}
                                            {rule.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                            disabled={savingPassword || !allRulesPassed}
                            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
