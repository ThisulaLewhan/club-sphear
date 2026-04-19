// frontend student registration form
// it sends email otp and creates account

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getStudentEmailFormatMessage,
  isValidStudentEmail,
  validateRegistration,
} from "@/lib/validations";
import { EyeIcon, EyeSlashIcon, CheckIcon, XIcon, EmailIcon, LockIcon, UserIcon, UserPlusIcon } from "@/components/icons";
import { inputBase, inputOk, inputErr, btnPrimary } from "@/lib/form-styles";

// top progress bar setup
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "Verify" },
    { num: 3, label: "Details" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
            currentStep > step.num
              ? "bg-emerald-500 text-white"
              : currentStep === step.num
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
              : "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400"
          }`}>
            {currentStep > step.num ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : step.num}
          </div>
          <span className={`text-xs font-medium hidden sm:inline ${
            currentStep >= step.num ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"
          }`}>{step.label}</span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
              currentStep > step.num ? "bg-emerald-500" : "bg-gray-200 dark:bg-zinc-700"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  // setup states for user inputs
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({ name: "", password: "", confirmPassword: "" });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // timer for resend otp cooldown
  const [resendTimer, setResendTimer] = useState(0);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // to move between 6 digit inputs easily
  const otpRefs = useRef([]);

  // check if password is safe and strong
  const pwChecks = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };
  const passedCount = Object.values(pwChecks).filter(Boolean).length;
  const strengthLabel = passedCount <= 1 ? "Weak" : passedCount <= 3 ? "Fair" : "Strong";
  const strengthColor = passedCount <= 1 ? "bg-red-500" : passedCount <= 3 ? "bg-amber-500" : "bg-emerald-500";
  const strengthWidth = passedCount === 0 ? "w-0" : passedCount === 1 ? "w-1/4" : passedCount === 2 ? "w-1/2" : passedCount === 3 ? "w-3/4" : "w-full";
  const strengthText = passedCount <= 1 ? "text-red-500" : passedCount <= 3 ? "text-amber-500" : "text-emerald-500";

  // when user clicks send otp button
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");
    setErrors({});

    if (!email || !isValidStudentEmail(email)) {
      setErrors({ email: getStudentEmailFormatMessage() });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setResendTimer(60);
        setServerSuccess("Verification code sent! Check your inbox.");
      } else {
        setServerError(data.message || "Failed to send code.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // move to next input boxes when typing otp
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setServerError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setServerError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        setServerSuccess("Email verified! Complete your registration.");
        setServerError("");
      } else {
        setServerError(data.message || "Invalid code.");
      }
    } catch {
      setServerError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setServerError("");
    setServerSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(60);
        setServerSuccess("New verification code sent!");
      } else {
        setServerError(data.message || "Failed to resend code.");
      }
    } catch {
      setServerError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // save final details to create account
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const fullData = { name: formData.name, email, password: formData.password, confirmPassword: formData.confirmPassword };
    const validation = validateRegistration(fullData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const result = await register(fullData);
      if (result.success) {
        router.push("/student-profile");
      } else {
        if (result.errors) setErrors(result.errors);
        setServerError(result.message || "Registration failed.");
      }
    } catch {
      setServerError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // HTML for the page UI
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-zinc-800 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
            <UserPlusIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Join Club Sphear as a student</p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Server Messages */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}
        {serverSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{serverSuccess}</p>
          </div>
        )}

        {/* step 1: ask for email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">SLIIT Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <EmailIcon />
                </span>
                <input type="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); setServerError(""); }} placeholder="it12345678@my.sliit.lk" className={`${inputBase} ${errors.email ? inputErr : inputOk}`} />
              </div>
              {!errors.email && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Use format: it12345678@my.sliit.lk</p>}
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Sending Code...
                </span>
              ) : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* step 2: type the code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{email}</p>
              <button type="button" onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setServerError(""); setServerSuccess(""); }} className="text-xs text-gray-400 hover:text-indigo-500 mt-1 underline transition-colors">
                Change email
              </button>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                    digit ? "border-indigo-400 focus:ring-indigo-500/30" : "border-gray-200 dark:border-zinc-700 focus:ring-indigo-500/30"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Verifying...
                </span>
              ) : "Verify Email"}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span className="text-gray-400">Resend in {resendTimer}s</span>
              ) : (
                <button type="button" onClick={handleResendOTP} disabled={loading} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-colors">
                  Resend Code
                </button>
              )}
            </p>
          </form>
        )}

        {/* step 3: ask for passwords and name */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Verified email badge */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Verified Email</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-300 truncate">{email}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon />
                </span>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`${inputBase} ${errors.name ? inputErr : inputOk}`} autoFocus />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon />
                </span>
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className={`${inputBase} !pr-12 ${errors.password ? inputErr : inputOk}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out ${strengthColor} ${strengthWidth}`} />
                    </div>
                    <span className={`text-xs font-semibold ${strengthText}`}>{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: "length", label: "6+ characters" },
                      { key: "uppercase", label: "Uppercase (A-Z)" },
                      { key: "lowercase", label: "Lowercase (a-z)" },
                      { key: "number", label: "Number (0-9)" },
                    ].map(({ key, label }) => (
                      <div key={key} className={`flex items-center gap-1.5 text-xs transition-colors ${pwChecks[key] ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                        {pwChecks[key] ? <CheckIcon /> : <XIcon />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                </span>
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className={`${inputBase} !pr-12 ${errors.confirmPassword ? inputErr : inputOk}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${formData.password === formData.confirmPassword ? "text-emerald-500" : "text-red-500"}`}>
                  {formData.password === formData.confirmPassword ? <><CheckIcon /> Passwords match</> : <><XIcon /> Passwords do not match</>}
                </p>
              )}
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-8 mb-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700"></div>
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700"></div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">Sign In →</Link>
        </p>
      </div>
    </div>
  );
}
