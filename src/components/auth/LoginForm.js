// student login component

"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { validateLogin } from "@/lib/validations";
import { EyeIcon, EyeSlashIcon, EmailIcon, LockIcon, KeyIcon } from "@/components/icons";
import { inputBase, inputOk, inputErr, btnPrimary } from "@/lib/form-styles";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = validateLogin(formData);
    if (!validation.valid) { setErrors(validation.errors); return; }

    setErrors({});
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const role = result.user?.role;
        const defaultPath = (role === "mainAdmin" || role === "admin") ? "/admin-dashboard" : (role === "club" ? "/club-dashboard" : "/");
        router.push(searchParams.get("redirect") || defaultPath);
      } else {
        setServerError(result.message || "Login failed.");
      }
    } catch { setServerError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-zinc-800 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
            <KeyIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Sign in to your Club Sphear account</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <EmailIcon />
              </span>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@university.ac.lk" className={`${inputBase} ${errors.email ? inputErr : inputOk}`} />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <LockIcon />
              </span>
              <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className={`${inputBase} !pr-12 ${errors.password ? inputErr : inputOk}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Signing In...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700"></div>
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700"></div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">Create Account →</Link>
        </p>
      </div>
    </div>
  );
}
