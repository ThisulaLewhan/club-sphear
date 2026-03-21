"use client";

// Feature Domain: The Global Admin System


import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { validatePassword } from "@/lib/validations";

export default function AdminProfileEditPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Initialize form data once user is loaded
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    setErrors({});

    // Frontend Validations
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (formData.password) {
      const pwCheck = validatePassword(formData.password);
      if (!pwCheck.valid) {
        newErrors.password = pwCheck.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          ...(formData.password && { password: formData.password })
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setStatus({ type: "success", text: "Profile updated successfully!" });
      await refreshUser();
      setTimeout(() => router.push("/admin-dashboard/profile"), 1500);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
          <h2 className="text-2xl font-bold text-white">Update Information</h2>
          <p className="text-indigo-100 mt-1 text-sm">Change your name or set a new password</p>
        </div>

        <div className="p-8">
          {status.text && (
            <div className={`p-4 mb-6 rounded-xl border flex items-start gap-3 ${status.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
              {status.type === "success" ? "✅" : "⚠️"} <span className="text-sm font-medium">{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm ${errors.name ? 'border-red-500' : 'border-gray-200 bg-gray-50'}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Email <span className="font-normal lowercase capitalize">(Read-only)</span></label>
              <div className="w-full px-4 py-3 border border-gray-100 bg-gray-50 text-gray-500 rounded-xl text-sm cursor-not-allowed">
                {user?.email || "—"}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">New Password <span className="font-normal text-gray-400 capitalize">(Leave empty to keep current)</span></label>
              <input 
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm ${errors.password ? 'border-red-500' : 'border-gray-200 bg-gray-50'}`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => router.push("/admin-dashboard/profile")}
                className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
