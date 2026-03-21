"use client";

// Feature Domain: The Global Admin System


import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { isValidEmail, validatePassword } from "@/lib/validations";

export default function CreateAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Frontend Guard
  useEffect(() => {
    if (!authLoading && user && user.role !== "mainAdmin") {
      router.push("/admin-dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend Validation
    if (formData.name.trim().length < 2) {
      setStatus({ type: "error", message: "Name must be at least 2 characters" });
      return;
    }
    if (!isValidEmail(formData.email)) {
      setStatus({ type: "error", message: "Please enter a valid email address" });
      return;
    }
    const pwCheck = validatePassword(formData.password);
    if (!pwCheck.valid) {
      setStatus({ type: "error", message: pwCheck.message });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      setStatus({ type: "success", message: "Administrator account created successfully!" });
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Admin Account</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-600 mb-6">Create a new administrator with platform-wide managing capabilities.</p>
        
        {status.type === "success" && (
          <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Sub Admin 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input 
              type="password" 
              required
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Error Message near password */}
          {status.type === "error" && (
            <div className="p-3 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-500 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"}`}
          >
            {isLoading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
