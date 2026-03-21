"use client";

import { useState } from "react";

export default function ClubProfileForm({ initialData }) {
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    description: initialData?.description || "",
    logo: initialData?.logo || "",
    password: "" 
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check club name length on frontend
    if (formData.name.trim().length < 2) {
      setStatus({ type: "error", message: "Club Name must be at least 2 characters long." });
      return;
    }
    
    // check description length on frontend (optional limit)
    if (formData.description && formData.description.length > 500) {
      setStatus({ type: "error", message: "Description must be under 500 characters." });
      return;
    }

    // basic logo url check
    if (formData.logo && !formData.logo.startsWith("http")) {
      setStatus({ type: "error", message: "Logo URL must start with http or https." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/club/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setStatus({ type: "success", message: "Club profile updated successfully!" });
      setFormData(prev => ({ ...prev, password: "" }));
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Email (Read-only)</label>
          <input 
            type="email" 
            disabled
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg"
            value={initialData?.email || ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Tell us about the club..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input 
            type="url" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={formData.logo}
            onChange={(e) => setFormData({...formData, logo: e.target.value})}
            placeholder="https://example.com/logo.png"
          />
          {formData.logo && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Logo Preview:</p>
              <img src={formData.logo} alt="Club Logo Preview" className="h-16 w-16 object-cover rounded shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-gray-800 font-semibold mb-4">Security</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            type="password" 
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full md:w-auto py-2.5 px-6 rounded-lg font-medium text-white transition ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm"}`}
        >
          {isLoading ? "Saving..." : "Save Profile Updates"}
        </button>
      </form>
    </div>
  );
}
