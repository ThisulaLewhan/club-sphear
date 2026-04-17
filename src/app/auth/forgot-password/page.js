// Feature Domain: Authentication & Access Control

"use client";

import { useState, useRef, useEffect } from "react";
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
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpRefs = useRef([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

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
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCountdown(60);
        otpRefs.current[0]?.focus();
      } else {
        setServerMessage(data.message || "Something went wrong.");
      }
    } catch {
      setServerMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take only last character
    setOtpDigits(newDigits);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (newDigits.every((d) => d !== "")) {
      handleVerifyOtp(null, newDigits);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pastedText.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedText.length && i < 6; i++) {
        newDigits[i] = pastedText[i];
      }
      setOtpDigits(newDigits);
      setOtpError("");

      // Focus last filled input or next empty one
      const focusIndex = Math.min(pastedText.length, 5);
      otpRefs.current[focusIndex]?.focus();

      // Auto-submit if all digits filled
      if (newDigits.every((d) => d !== "")) {
        handleVerifyOtp(null, newDigits);
      }
    }
  };

  const handleVerifyOtp = async (e, digitsToSubmit) => {
    if (e) e.preventDefault();
    setOtpError("");
    setServerMessage("");

    const otpCode = (digitsToSubmit || otpDigits).join("");

    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`);
      } else {
        setOtpError(data.message || "Invalid OTP.");
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
      setOtpDigits(["", "", "", "", "", ""]);
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
                    placeholder="your-email@example.com"
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
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Reset Code</label>

                {/* OTP Digit Boxes */}
                <div className="flex gap-2.5 justify-center mb-4" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      placeholder="0"
                      disabled={loading}
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                        otpError
                          ? "border-red-400 bg-red-50 dark:bg-red-950/20 text-red-600"
                          : digit
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-gray-900 dark:text-white"
                          : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-zinc-800`}
                    />
                  ))}
                </div>

                {/* Visual feedback */}
                <div className="text-center mb-4">
                  {otpDigits.every((d) => d !== "") && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      All digits entered
                    </p>
                  )}
                </div>

                {otpError && <p className="text-xs text-red-500 font-medium text-center">{otpError}</p>}
              </div>

              <button type="submit" disabled={loading || !otpDigits.every((d) => d !== "")} className={btnPrimary}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Verifying...
                  </span>
                ) : "Verify Code"}
              </button>

              {/* Resend Code Button */}
              <div className="pt-2 text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resend code in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{resendCountdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↻ Resend Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setOtpDigits(["", "", "", "", "", ""]); setOtpError(""); setServerMessage(""); setResendCountdown(0); }}
                className="w-full text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-semibold transition-colors"
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
