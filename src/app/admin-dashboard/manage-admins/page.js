"use client";

import { useState, useEffect } from "react";

export default function ManageAdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/manage-admins");
            const data = await res.json();
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDelete = async (adminId, adminName) => {
        if (!confirm(`Are you sure you want to permanently delete the sub-admin account for "${adminName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(adminId);
            const res = await fetch(`/api/admin/manage-admins/${adminId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                setAdmins(admins.filter(a => a.id !== adminId));
            } else {
                alert(data.error || "Failed to delete admin");
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
            alert("An error occurred while deleting the admin.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Manage Sub-Admins</h1>
                <p className="text-slate-600 text-base">View all registered sub-admin accounts and revoke their access by deleting them.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin Name</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse">Loading admins...</div>
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No sub-admins found.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                                    {admin.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-800">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">
                                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(admin.id, admin.name)}
                                                disabled={deletingId === admin.id}
                                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === admin.id
                                                        ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    }`}
                                            >
                                                {deletingId === admin.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
