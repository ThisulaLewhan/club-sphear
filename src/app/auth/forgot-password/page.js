// Feature Domain: Authentication & Access Control

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmailIcon } from "@/components/icons";
import { inputBase, inputOk, inputErr, btnPrimary } from "@/lib/form-styles";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // step 1: email — step 2: otp
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setEmailError("");
    setServerMessage("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setServerMessage(data.message || "Something went wrong.");
      }
    } catch {
      setServerMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setServerMessage("");

    if (!otp.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("OTP must be a 6-digit number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`);
      } else {
        setOtpError(data.message || "Invalid OTP.");
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-zinc-800 p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? "Forgot Password" : "Enter Reset Code"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
              {step === 1
                ? "Enter your email and we'll send you a reset code."
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-indigo-500" : "bg-gray-200 dark:bg-zinc-700"}`}></div>
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-indigo-500" : "bg-gray-200 dark:bg-zinc-700"}`}></div>
          </div>

          {serverMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{serverMessage}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="you@university.ac.lk"
                    className={`${inputBase} ${emailError ? inputErr : inputOk}`}
                  />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-red-500 font-medium">{emailError}</p>}
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Sending Code...
                  </span>
                ) : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reset Code</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setOtpError(""); }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 text-center text-xl tracking-[0.5em] font-bold ${otpError ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : "border-gray-200 dark:border-zinc-700 focus:ring-indigo-500/30 focus:border-indigo-500"}`}
                />
                {otpError && <p className="mt-1.5 text-xs text-red-500 font-medium">{otpError}</p>}
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Verifying...
                  </span>
                ) : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); setOtpError(""); setServerMessage(""); }}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                ← Use a different email
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
