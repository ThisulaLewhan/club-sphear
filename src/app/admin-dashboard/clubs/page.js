"use client";

// Feature Domain: The Global Admin System

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { isValidEmail, validatePassword } from "@/lib/validations";

const CATEGORIES = [
    "Technology & Innovation",
    "Academic & Professional",
    "Arts & Humanities",
    "Business & Leadership",
    "Community & Social",
    "Media & Communications",
    "Recreation & Esports",
];

// ── Create Club Tab ───────────────────────────────────────────────────────────
function CreateClubTab() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ clubName: "", category: "", description: "", clubEmail: "", password: "" });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        if (!authLoading && user && user.role !== "mainAdmin") router.push("/admin-dashboard");
    }, [user, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.clubName.trim().length < 2) { setStatus({ type: "error", message: "Club name must be at least 2 characters" }); return; }
        if (!isValidEmail(formData.clubEmail)) { setStatus({ type: "error", message: "Please enter a valid email address" }); return; }
        const pwCheck = validatePassword(formData.password);
        if (!pwCheck.valid) { setStatus({ type: "error", message: pwCheck.message }); return; }
        setIsLoading(true); setStatus({ type: "", message: "" }); setCreatedCredentials(null);
        try {
            const res = await fetch("/api/admin/create-club", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create club");
            setStatus({ type: "success", message: "Club account created successfully!" });
            setCreatedCredentials({ email: formData.clubEmail, password: formData.password, clubName: formData.clubName, category: formData.category });
            setFormData({ clubName: "", category: "", description: "", clubEmail: "", password: "" });
        } catch (err) { setStatus({ type: "error", message: err.message }); } finally { setIsLoading(false); }
    };

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    return (
        <div>
            {createdCredentials && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <h3 className="font-bold text-emerald-800">Club Created — Share These Credentials</h3>
                    </div>
                    <div className="space-y-3 bg-white rounded-xl p-4 border border-emerald-100">
                        {[
                            { label: "Club Name", value: createdCredentials.clubName, copy: false },
                            { label: "Category", value: createdCredentials.category, copy: false },
                            { label: "Login Email", value: createdCredentials.email, copy: true },
                            { label: "Password", value: createdCredentials.password, copy: true },
                        ].map(({ label, value, copy }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div><p className="text-xs text-slate-400 font-medium uppercase">{label}</p><p className="text-sm font-semibold text-slate-800 font-mono">{value}</p></div>
                                {copy && <button onClick={() => copyToClipboard(value)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors">Copy</button>}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-emerald-600 mt-3">⚠️ Save these credentials now. The password cannot be retrieved later.</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Club Name</label>
                        <input type="text" required placeholder="e.g. IEEE Student Branch" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm" value={formData.clubName} onChange={(e) => setFormData({ ...formData, clubName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                        <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            <option value="">Select a category...</option>
                            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                        <textarea rows="3" placeholder="Brief description of the club..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none text-sm" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-1">Login Credentials</h3>
                        <p className="text-xs text-slate-500 mb-4">These credentials will be given to the club committee to log in.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Club Email</label>
                                <input type="email" required placeholder="club@example.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm" value={formData.clubEmail} onChange={(e) => setFormData({ ...formData, clubEmail: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                <input type="text" required minLength={6} placeholder="Minimum 6 characters" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    {status.type === "error" && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">{status.message}</div>
                    )}
                    <button type="submit" disabled={isLoading} className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white transition text-sm ${isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"}`}>
                        {isLoading ? "Creating Club..." : "Create Club Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Manage Clubs Tab ──────────────────────────────────────────────────────────
function ManageClubsTab() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (!authLoading && user && user.role !== "mainAdmin") router.push("/admin-dashboard");
    }, [user, authLoading, router]);

    const fetchClubs = async () => {
        try { setLoading(true); const res = await fetch("/api/admin/manage-clubs"); const data = await res.json(); if (data.success) setClubs(data.data); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchClubs(); }, []);

    const handleDelete = async (clubId, clubName) => {
        const confirmed = await confirm(`This will permanently delete the club "${clubName}" and its login account. This cannot be undone.`, { title: "Delete Club?", confirmText: "Delete", variant: "danger" });
        if (!confirmed) return;
        try { setDeletingId(clubId); const res = await fetch(`/api/admin/manage-clubs/${clubId}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { setClubs(clubs.filter(c => c.id !== clubId)); toast.success(`Club "${clubName}" deleted.`); } else { toast.error(data.error || "Failed to delete club"); } } catch { toast.error("An error occurred."); } finally { setDeletingId(null); }
    };

    return (
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
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400"><div className="animate-pulse">Loading clubs...</div></td></tr>
                        ) : clubs.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No clubs found.</td></tr>
                        ) : clubs.map((club) => (
                            <tr key={club.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {club.logo ? (
                                            <img src={club.logo} alt={club.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">{club.name.charAt(0)}</div>
                                        )}
                                        <span className="font-semibold text-slate-800">{club.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{club.category}</span></td>
                                <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-600 font-mono">{club.email}</td>
                                <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500">{club.createdAt ? new Date(club.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(club.id, club.name)} disabled={deletingId === club.id} className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === club.id ? "text-slate-400 bg-slate-100 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}>
                                        {deletingId === club.id ? "Deleting..." : "Delete"}
                                    </button>
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
export default function ClubsPage() {
    const [tab, setTab] = useState("create");

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Clubs &amp; Societies</h1>
                <p className="text-slate-500">Create and manage club accounts.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setTab("create")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "create" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    + Create Club
                </button>
                <button
                    onClick={() => setTab("manage")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "manage" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Manage Clubs
                </button>
            </div>

            {tab === "create" ? <CreateClubTab /> : <ManageClubsTab />}
        </div>
    );
}
