"use client";

// Feature Domain: Club Management & Operations

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

// ── Create Notice Tab ─────────────────────────────────────────────────────────
function CreateNoticeTab() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("normal");
    const [expiresAt, setExpiresAt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
        if (title.length > 100) { setError("Title must be under 100 characters."); return; }
        if (content.length > 1000) { setError("Content must be under 1000 characters."); return; }
        if (!expiresAt) { setError("Expiration date is required."); return; }
        if (new Date(expiresAt) <= new Date()) { setError("Expiration date must be in the future."); return; }
        setIsSubmitting(true); setError(""); setSuccess(false);
        try {
            const res = await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content, priority, expiresAt }) });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed to create notice"); }
            setSuccess(true); setTitle(""); setContent(""); setPriority("normal"); setExpiresAt("");
        } catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {success && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    Notice published successfully!
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notice Title *</label>
                    <input type="text" placeholder="e.g. Important Meeting Tomorrow!" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-semibold" disabled={isSubmitting} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content *</label>
                    <textarea placeholder="What's the announcement about?" value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none" disabled={isSubmitting} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setPriority("normal")} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${priority === "normal" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>🟢 Normal</button>
                        <button type="button" onClick={() => setPriority("urgent")} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${priority === "urgent" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>🔴 Urgent</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Expiration Date *</label>
                    <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all" disabled={isSubmitting} />
                    <p className="text-xs text-slate-400 mt-1.5">The notice will be automatically removed after this date.</p>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
                    {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Publishing...</> : <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        Publish Notice
                    </>}
                </button>
            </form>
        </div>
    );
}

// ── Manage Notices Tab ────────────────────────────────────────────────────────
function ManageNoticesTab() {
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
        try { setLoading(true); const res = await fetch("/api/club-dashboard/manage-notices"); const data = await res.json(); if (data.success) setNotices(data.data); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchNotices(); }, []);

    const handleDelete = async (noticeId, noticeTitle) => {
        const confirmed = await confirm(`This will permanently delete the notice "${noticeTitle}".`, { title: "Delete Notice?", confirmText: "Delete", variant: "danger" });
        if (!confirmed) return;
        try { setDeletingId(noticeId); const res = await fetch(`/api/notices/${noticeId}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { setNotices(notices.filter(n => n.id !== noticeId)); toast.success(`Notice deleted.`); } else { toast.error(data.error || "Failed to delete"); } } catch { toast.error("An error occurred."); } finally { setDeletingId(null); }
    };

    const startEdit = (n) => { setEditingId(n.id); setEditTitle(n.title); setEditContent(n.content); setEditPriority(n.priority); };
    const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditContent(""); setEditPriority("normal"); };

    const saveEdit = async (noticeId) => {
        try {
            setSavingId(noticeId);
            const res = await fetch(`/api/notices/${noticeId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle, content: editContent, priority: editPriority }) });
            const data = await res.json();
            if (data.success) { setNotices(notices.map(n => n.id === noticeId ? { ...n, title: editTitle, content: editContent, priority: editPriority } : n)); cancelEdit(); toast.success("Notice updated."); } else { toast.error(data.error || "Failed to update"); }
        } catch { toast.error("An error occurred."); } finally { setSavingId(null); }
    };

    const getPriorityStyle = (p) => p === "urgent" ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200";

    return (
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
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400"><div className="animate-pulse">Loading notices...</div></td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Notices Yet</h3>
                                    <p className="text-slate-500 text-sm">Switch to Create Notice to publish your first announcement!</p>
                                </div>
                            </td></tr>
                        ) : notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    {editingId === notice.id ? (
                                        <div className="flex flex-col gap-2">
                                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                                        </div>
                                    ) : (<div><p className="font-bold text-slate-800">{notice.title}</p><p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notice.content}</p></div>)}
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                    {editingId === notice.id ? (
                                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                            <option value="normal">Normal</option><option value="urgent">Urgent</option>
                                        </select>
                                    ) : (<span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${getPriorityStyle(notice.priority)}`}>{notice.priority}</span>)}
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {editingId === notice.id ? (
                                            <>
                                                <button onClick={() => saveEdit(notice.id)} disabled={savingId === notice.id} className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50">{savingId === notice.id ? "Saving..." : "Save"}</button>
                                                <button onClick={cancelEdit} className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(notice)} className="text-sm font-semibold px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(notice.id, notice.title)} disabled={deletingId === notice.id} className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === notice.id ? "text-slate-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}>{deletingId === notice.id ? "Deleting..." : "Delete"}</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NoticesPage() {
    const [tab, setTab] = useState("create");

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Notices</h1>
                <p className="text-slate-500 text-base">Create and manage your club&apos;s announcements.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setTab("create")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "create" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    + Create Notice
                </button>
                <button
                    onClick={() => setTab("manage")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "manage" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Manage Notices
                </button>
            </div>

            {tab === "create" ? <CreateNoticeTab /> : <ManageNoticesTab />}
        </div>
    );
}
