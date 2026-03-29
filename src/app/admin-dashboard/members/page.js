"use client";

// Feature Domain: The Global Admin System

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

function ProfileModal({ member, onClose }) {
    if (!member) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Member Profile</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{member.name}</h4>
                            <p className="text-sm font-medium text-slate-500">{member.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                            {member.isBanned ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-sm font-bold">Banned Account</span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-sm font-bold">Active Member</span>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">University</p>
                            <p className="text-sm font-medium text-slate-800">{member.university}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Student ID</p>
                            <p className="text-sm font-mono font-medium text-slate-800">{member.studentId}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{member.bio}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ManageMembersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // Guard: Only mainAdmin or admin can view this page
    useEffect(() => {
        if (!authLoading && user && (user.role !== "mainAdmin" && user.role !== "admin")) {
            router.push("/admin-dashboard");
        }
    }, [user, authLoading, router]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/members");
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load members list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchMembers();
    }, [user]);

    const handleToggleBan = async (memberId, memberName, currentStatus) => {
        const action = currentStatus ? "unban" : "ban";
        
        const confirmed = await confirm(
            currentStatus 
                ? `Are you sure you want to restore access for ${memberName}?`
                : `Are you sure you want to suspend access for ${memberName}? They will be immediately logged out and unable to log back in until unbanned.`,
            { 
                title: currentStatus ? "Unban Account?" : "Ban Account?", 
                confirmText: currentStatus ? "Restore Access" : "Ban User", 
                variant: currentStatus ? "default" : "danger" 
            }
        );
        
        if (!confirmed) return;

        try {
            setUpdatingId(memberId);
            const res = await fetch(`/api/admin/members/${memberId}/ban`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isBanned: !currentStatus })
            });
            const data = await res.json();

            if (data.success) {
                setMembers(members.map(m => m.id === memberId ? { ...m, isBanned: !currentStatus } : m));
                toast.success(`Account for ${memberName} has been ${currentStatus ? 'restored' : 'suspended'}.`);
            } else {
                toast.error(data.error || `Failed to ${action} member`);
            }
        } catch (error) {
            console.error(`Error trying to ${action} member:`, error);
            toast.error(`An error occurred while trying to ${action} the member.`);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Members</h1>
                <p className="text-slate-500">View registered students and manage platform access.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 hidden md:table-cell">University</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse">Loading members...</div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No registered members found.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white ${member.isBanned ? 'bg-red-400' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className={`font-bold block ${member.isBanned ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                                                        {member.name}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400">{member.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm font-medium text-slate-600">
                                                {member.university || <span className="text-slate-300 italic">Not specified</span>}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {member.isBanned ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    View Profile
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleToggleBan(member.id, member.name, member.isBanned)}
                                                    disabled={updatingId === member.id}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${
                                                        updatingId === member.id
                                                            ? "text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed"
                                                            : member.isBanned
                                                                ? "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" // Unban styling
                                                                : "text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700" // Ban styling
                                                    }`}
                                                >
                                                    {updatingId === member.id ? "Wait..." : member.isBanned ? "Unban Account" : "Ban Account"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
        </div>
    );
}
