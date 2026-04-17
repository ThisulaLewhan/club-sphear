"use client";

// Feature Domain: The Global Admin System

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { isValidEmail, validatePassword } from "@/lib/validations";

// ── Create Admin Tab ──────────────────────────────────────────────────────────
function CreateAdminTab() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user && user.role !== "mainAdmin") router.push("/admin-dashboard");
    }, [user, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name.trim().length < 2) { setStatus({ type: "error", message: "Name must be at least 2 characters" }); return; }
        if (!isValidEmail(formData.email)) { setStatus({ type: "error", message: "Please enter a valid email address" }); return; }
        const pwCheck = validatePassword(formData.password);
        if (!pwCheck.valid) { setStatus({ type: "error", message: pwCheck.message }); return; }
        setIsLoading(true); setStatus({ type: "", message: "" });
        try {
            const res = await fetch("/api/admin/create-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create admin");
            setStatus({ type: "success", message: "Administrator account created successfully!" });
            setFormData({ name: "", email: "", password: "" });
        } catch (err) { setStatus({ type: "error", message: err.message }); } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {status.type === "success" && (
                <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500">{status.message}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" required placeholder="e.g. Sub Admin 1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" required placeholder="admin@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                    <input type="password" required placeholder="Minimum 6 characters" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                {status.type === "error" && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-500 text-sm font-medium">{status.message}</div>
                )}
                <button type="submit" disabled={isLoading} className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"}`}>
                    {isLoading ? "Creating Account..." : "Create Admin Account"}
                </button>
            </form>
        </div>
    );
}

// ── Manage Admins Tab ─────────────────────────────────────────────────────────
function ManageAdminsTab() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        if (!authLoading && user && user.role !== "mainAdmin") router.push("/admin-dashboard");
    }, [user, authLoading, router]);

    const fetchAdmins = async () => {
        try { setLoading(true); const res = await fetch("/api/admin/manage-admins"); const data = await res.json(); if (data.success) setAdmins(data.data); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchAdmins(); }, []);

    const handleDelete = async (adminId, adminName) => {
        const confirmed = await confirm(`This will permanently delete the sub-admin account for "${adminName}". This cannot be undone.`, { title: "Delete Sub-Admin?", confirmText: "Delete", variant: "danger" });
        if (!confirmed) return;
        try { setDeletingId(adminId); const res = await fetch(`/api/admin/manage-admins/${adminId}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { setAdmins(admins.filter(a => a.id !== adminId)); toast.success(`Sub-admin "${adminName}" deleted.`); } else { toast.error(data.error || "Failed to delete admin"); } } catch { toast.error("An error occurred."); } finally { setDeletingId(null); }
    };

    const handleToggleRole = async (admin) => {
        const action = admin.role === "admin" ? "promote" : "demote";
        const label = action === "promote" ? "Main Admin" : "Sub Admin";
        const confirmed = await confirm(
            `Are you sure you want to ${action} "${admin.name}" to ${label}?`,
            { title: `${action === "promote" ? "Promote" : "Demote"} Admin?`, confirmText: action === "promote" ? "Promote" : "Demote", variant: action === "promote" ? "primary" : "warning" }
        );
        if (!confirmed) return;
        try {
            setTogglingId(admin.id);
            const res = await fetch(`/api/admin/manage-admins/${admin.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                setAdmins(admins.map(a => a.id === admin.id ? { ...a, role: data.data.role } : a));
                toast.success(data.message);
            } else {
                toast.error(data.error || "Failed to update role");
            }
        } catch { toast.error("An error occurred."); } finally { setTogglingId(null); }
    };

    const isSelf = (adminId) => user && user.id === adminId;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Admin Name</th>
                            <th className="px-6 py-4">Email Address</th>
                            <th className="px-6 py-4 hidden sm:table-cell">Role</th>
                            <th className="px-6 py-4 hidden sm:table-cell">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400"><div className="animate-pulse">Loading admins...</div></td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No admins found.</td></tr>
                        ) : admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${admin.role === "mainAdmin" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>{admin.name.charAt(0)}</div>
                                        <span className="font-semibold text-slate-800">
                                            {admin.name}
                                            {isSelf(admin.id) && <span className="ml-1.5 text-xs text-slate-400 font-normal">(You)</span>}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{admin.email}</td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${admin.role === "mainAdmin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                                        {admin.role === "mainAdmin" ? "Main" : "Sub"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* Promote / Demote button */}
                                        {!isSelf(admin.id) && (
                                            <button
                                                onClick={() => handleToggleRole(admin)}
                                                disabled={togglingId === admin.id}
                                                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${togglingId === admin.id
                                                    ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                    : admin.role === "admin"
                                                        ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                        : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    }`}
                                            >
                                                {togglingId === admin.id ? "Updating..." : admin.role === "admin" ? "Promote" : "Demote"}
                                            </button>
                                        )}
                                        {/* Delete button — only for sub-admins, not self */}
                                        {admin.role === "admin" && !isSelf(admin.id) && (
                                            <button onClick={() => handleDelete(admin.id, admin.name)} disabled={deletingId === admin.id} className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === admin.id ? "text-slate-400 bg-slate-100 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}>
                                                {deletingId === admin.id ? "Deleting..." : "Delete"}
                                            </button>
                                        )}
                                        {isSelf(admin.id) && <span className="text-xs text-slate-400 italic">Current user</span>}
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
export default function AdminsPage() {
    const [tab, setTab] = useState("create");

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Admins</h1>
                <p className="text-slate-500">Create and manage sub-administrator accounts.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setTab("create")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "create" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    + Create Admin
                </button>
                <button
                    onClick={() => setTab("manage")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "manage" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Manage Admins
                </button>
            </div>

            {tab === "create" ? <CreateAdminTab /> : <ManageAdminsTab />}
        </div>
    );
}
