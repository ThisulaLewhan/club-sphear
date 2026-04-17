"use client";

// Feature Domain: Club Management & Operations


import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

export default function ManageNoticesPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editPriority, setEditPriority] = useState("normal");
    const [savingId, setSavingId] = useState(null);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/club-dashboard/manage-notices");
            const data = await res.json();
            if (data.success) {
                setNotices(data.data);
            }
        } catch (error) {
            console.error("Error fetching notices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleDelete = async (noticeId, noticeTitle) => {
        const confirmed = await confirm(
            `This will permanently delete the notice "${noticeTitle}".`,
            { title: "Delete Notice?", confirmText: "Delete", variant: "danger" }
        );
        if (!confirmed) return;

        try {
            setDeletingId(noticeId);
            const res = await fetch(`/api/notices/${noticeId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setNotices(notices.filter(n => n.id !== noticeId));
                toast.success(`Notice "${noticeTitle}" deleted successfully.`);
            } else {
                toast.error(data.error || "Failed to delete notice");
            }
        } catch (error) {
            toast.error("An error occurred while deleting.");
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (notice) => {
        setEditingId(notice.id);
        setEditTitle(notice.title);
        setEditContent(notice.content);
        setEditPriority(notice.priority);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setEditPriority("normal");
    };

    const saveEdit = async (noticeId) => {
        try {
            setSavingId(noticeId);
            const res = await fetch(`/api/notices/${noticeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle, content: editContent, priority: editPriority }),
            });
            const data = await res.json();
            if (data.success) {
                setNotices(notices.map(n => n.id === noticeId ? { ...n, title: editTitle, content: editContent, priority: editPriority } : n));
                cancelEdit();
                toast.success("Notice updated successfully.");
            } else {
                toast.error(data.error || "Failed to update notice");
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        } finally {
            setSavingId(null);
        }
    };

    const getPriorityStyle = (priority) => {
        return priority === "urgent"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200";
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Manage Notices</h1>
                <p className="text-slate-600 text-base">View, edit, or delete your club&apos;s published announcements.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Notice</th>
                                <th className="px-6 py-4 hidden md:table-cell">Priority</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse">Loading notices...</div>
                                    </td>
                                </tr>
                            ) : notices.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700 mb-1">No Notices Yet</h3>
                                            <p className="text-slate-500 text-sm">Head over to Create Notice to publish your first announcement!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                notices.map((notice) => (
                                    <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {editingId === notice.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        rows={2}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-bold text-slate-800">{notice.title}</p>
                                                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notice.content}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {editingId === notice.id ? (
                                                <select
                                                    value={editPriority}
                                                    onChange={(e) => setEditPriority(e.target.value)}
                                                    className="px-2 py-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${getPriorityStyle(notice.priority)}`}>
                                                    {notice.priority}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">
                                            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {editingId === notice.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(notice.id)}
                                                            disabled={savingId === notice.id}
                                                            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {savingId === notice.id ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(notice)}
                                                            className="text-sm font-semibold px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notice.id, notice.title)}
                                                            disabled={deletingId === notice.id}
                                                            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === notice.id
                                                                    ? "text-slate-400 cursor-not-allowed"
                                                                    : "text-red-600 hover:bg-red-50"
                                                                }`}
                                                        >
                                                            {deletingId === notice.id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
