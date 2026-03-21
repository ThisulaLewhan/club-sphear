"use client";

import { useState, useEffect } from "react";

export default function ManageClubsPage() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchClubs = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/manage-clubs");
            const data = await res.json();
            if (data.success) {
                setClubs(data.data);
            }
        } catch (error) {
            console.error("Error fetching clubs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const handleDelete = async (clubId, clubName) => {
        if (!confirm(`Are you sure you want to permanently delete the club "${clubName}" and its login account? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(clubId);
            const res = await fetch(`/api/admin/manage-clubs/${clubId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                setClubs(clubs.filter(c => c.id !== clubId));
            } else {
                alert(data.error || "Failed to delete club");
            }
        } catch (error) {
            console.error("Error deleting club:", error);
            alert("An error occurred while deleting the club.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Manage Clubs &amp; Societies</h1>
                <p className="text-slate-600 text-base">View all registered clubs and securely delete them along with their user accounts.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Club Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Login Email</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse">Loading clubs...</div>
                                    </td>
                                </tr>
                            ) : clubs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No clubs found.
                                    </td>
                                </tr>
                            ) : (
                                clubs.map((club) => (
                                    <tr key={club.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {club.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-800">{club.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {club.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-600 font-mono">
                                            {club.email}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500">
                                            {club.createdAt ? new Date(club.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(club.id, club.name)}
                                                disabled={deletingId === club.id}
                                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === club.id
                                                    ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                    : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    }`}
                                            >
                                                {deletingId === club.id ? "Deleting..." : "Delete"}
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
