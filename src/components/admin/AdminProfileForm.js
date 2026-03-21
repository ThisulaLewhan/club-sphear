"use client";

// Feature Domain: The Global Admin System


import { useState } from "react";

export default function AdminProfileForm({ initialData }) {
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    password: "" 
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // check name length on frontend
    if (formData.name.trim().length < 2) {
      setStatus({ type: "error", message: "Name must be at least 2 characters long." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setStatus({ type: "success", message: "Profile updated successfully!" });
      setFormData(prev => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {status.message && (
        <div className={`p-4 mb-6 rounded-lg ${status.type === "error" ? "bg-red-50 text-red-800 border-l-4 border-red-500" : "bg-green-50 text-green-800 border-l-4 border-green-500"}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read-only)</label>
          <input 
            type="email" 
            disabled
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg"
            value={initialData?.email || ""}
          />
          <p className="text-xs text-gray-400 mt-1">To change your email, contact a Main Admin.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-gray-800 font-semibold mb-4">Security</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            type="password" 
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full md:w-auto py-2.5 px-6 rounded-lg font-medium text-white transition ${isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-sm"}`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
