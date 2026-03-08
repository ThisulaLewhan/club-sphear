"use client";

import { useState } from "react";

export default function CreateClubPage() {
  const [formData, setFormData] = useState({ clubName: "", description: "", clubEmail: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

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

      setStatus({ type: "success", message: "Club profile and linked account created successfully!" });
      setFormData({ clubName: "", description: "", clubEmail: "", password: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Club</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-600 mb-6">Create a club profile and generate the root account for the club executives.</p>
        
        {status.message && (
          <div className={`p-4 mb-6 rounded-lg ${status.type === "error" ? "bg-red-50 text-red-800 border-l-4 border-red-500" : "bg-green-50 text-green-800 border-l-4 border-green-500"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={formData.clubName}
              onChange={(e) => setFormData({...formData, clubName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description (Optional)</label>
            <textarea 
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Linked Account Details</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Contact Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.clubEmail}
                  onChange={(e) => setFormData({...formData, clubEmail: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition ${isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow"}`}
          >
            {isLoading ? "Creating Club..." : "Register Club & Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
