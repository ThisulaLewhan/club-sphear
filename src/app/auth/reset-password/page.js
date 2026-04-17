// Feature Domain: Authentication & Access Control

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, LockIcon } from "@/components/icons";
import { inputBase, inputOk, inputErr, btnPrimary } from "@/lib/form-styles";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500 mb-4">Invalid or missing reset link. Please start over.</p>
        <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">← Back to Forgot Password</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const { newPassword, confirmPassword } = formData;
    const newErrors = { newPassword: "", confirmPassword: "" };
    let hasError = false;

    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Must be at least 6 characters.";
      hasError = true;
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = "Must contain at least one uppercase letter.";
      hasError = true;
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = "Must contain at least one lowercase letter.";
      hasError = true;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      newErrors.newPassword = "Must contain at least one special character.";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      hasError = true;
    } else if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2500);
      } else {
        setServerError(data.message || "Failed to reset password.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password Reset!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your password has been updated. Redirecting to sign in...</p>
        <Link href="/auth/login" className="inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold transition-colors">Go to Sign In →</Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
          <LockIcon />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Create a strong new password for your account.</p>
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
        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <LockIcon />
            </span>
            <input
              type={showPasswords.new ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Min 6 chars, upper, lower, special"
              className={`${inputBase} !pr-12 ${errors.newPassword ? inputErr : inputOk}`}
            />
            <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
              {showPasswords.new ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.newPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.newPassword}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <LockIcon />
            </span>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              className={`${inputBase} !pr-12 ${errors.confirmPassword ? inputErr : inputOk}`}
            />
            <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
              {showPasswords.confirm ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              Resetting Password...
            </span>
          ) : "Reset Password"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">
            Sign In →
          </Link>
        </p>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-zinc-800 p-8 sm:p-10">
          <Suspense fallback={<div className="flex justify-center"><span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-r-transparent"></span></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
