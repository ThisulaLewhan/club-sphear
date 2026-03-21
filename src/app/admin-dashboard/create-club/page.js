"use client";

// Feature Domain: The Global Admin System


import { useState } from "react";

const CATEGORIES = [
  "Technology & Innovation",
  "Academic & Professional",
  "Arts & Humanities",
  "Business & Leadership",
  "Community & Social",
  "Media & Communications",
  "Recreation & Esports",
];

export default function CreateClubPage() {
  const [formData, setFormData] = useState({ clubName: "", category: "", description: "", clubEmail: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    setCreatedCredentials(null);

    try {
      const res = await fetch("/api/admin/create-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create club");
      }

      setStatus({ type: "success", message: "Club account created successfully!" });
      setCreatedCredentials({ email: formData.clubEmail, password: formData.password, clubName: formData.clubName, category: formData.category });
      setFormData({ clubName: "", category: "", description: "", clubEmail: "", password: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Create New Club</h1>
      <p className="text-slate-500 text-sm mb-6">Register a club and generate login credentials for the committee.</p>

      {/* Success: Show credentials card */}
      {createdCredentials && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <h3 className="font-bold text-emerald-800">Club Created — Share These Credentials</h3>
          </div>
          <div className="space-y-3 bg-white rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Club Name</p>
                <p className="text-sm font-semibold text-slate-800">{createdCredentials.clubName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Category</p>
                <p className="text-sm font-semibold text-slate-800">{createdCredentials.category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Login Email</p>
                <p className="text-sm font-mono font-semibold text-slate-800">{createdCredentials.email}</p>
              </div>
              <button onClick={() => copyToClipboard(createdCredentials.email)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors">
                Copy
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Password</p>
                <p className="text-sm font-mono font-semibold text-slate-800">{createdCredentials.password}</p>
              </div>
              <button onClick={() => copyToClipboard(createdCredentials.password)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors">
                Copy
              </button>
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-3">⚠️ Save these credentials now. The password cannot be retrieved later.</p>
        </div>
      )}

      {/* Error */}
      {status.type === "error" && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Club Name</label>
            <input
              type="text"
              required
              placeholder="e.g. IEEE Student Branch"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
              value={formData.clubName}
              onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              rows="3"
              placeholder="Brief description of the club..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-1">Login Credentials</h3>
            <p className="text-xs text-slate-500 mb-4">These credentials will be given to the club committee to log in.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Club Email</label>
                <input
                  type="email"
                  required
                  placeholder="club@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                  value={formData.clubEmail}
                  onChange={(e) => setFormData({ ...formData, clubEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm font-mono"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white transition text-sm ${isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"}`}
          >
            {isLoading ? "Creating Club..." : "Create Club Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
