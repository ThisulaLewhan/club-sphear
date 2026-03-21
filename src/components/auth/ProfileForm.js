// student profile edit form

"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { inputBase, inputOk, inputErr } from "@/lib/form-styles";

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    university: user?.university || "",
    studentId: user?.studentId || "",
    bio: user?.bio || "",
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: "", text: "" });

    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (formData.bio && formData.bio.length > 500) newErrors.bio = "Bio must be under 500 characters";
    if (formData.studentId && formData.studentId.length > 20) newErrors.studentId = "Student ID must be under 20 characters";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setServerMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => router.push("/student-profile"), 1500);
      } else {
        if (result.errors) setErrors(result.errors);
        setServerMessage({ type: "error", text: result.message || "Update failed." });
      }
    } catch { setServerMessage({ type: "error", text: "Something went wrong." }); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Edit Profile</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Update your student information</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {serverMessage.text && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              serverMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
            }`}>
              {serverMessage.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
              )}
              <p className={`text-sm font-medium ${serverMessage.type === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{serverMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* stuff user cant edit */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                Account Details (Read-only)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 text-gray-500 dark:text-gray-400 text-sm truncate">{user?.email || "—"}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800"></div>

            {/* stuff user can edit */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                Personal Information
              </h3>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
                    </span>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${inputBase} ${errors.name ? inputErr : inputOk}`} />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* University */}
                  <div>
                    <label htmlFor="university" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">University</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
                      </span>
                      <input type="text" id="university" name="university" value={formData.university} onChange={handleChange} placeholder="e.g., SLIIT" className={`${inputBase} ${inputOk}`} />
                    </div>
                  </div>
                  {/* Student ID */}
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Student ID</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>
                      </span>
                      <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="e.g., IT21000000" className={`${inputBase} ${errors.studentId ? inputErr : inputOk}`} />
                    </div>
                    {errors.studentId && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.studentId}</p>}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={500} placeholder="Tell us about yourself..."
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${errors.bio ? inputErr : inputOk}`}
                  />
                  <div className="flex justify-between mt-1.5">
                    {errors.bio ? <p className="text-xs text-red-500 font-medium">{errors.bio}</p> : <span></span>}
                    <p className={`text-xs font-medium ${formData.bio.length > 450 ? "text-amber-500" : "text-gray-400"}`}>{formData.bio.length}/500</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button type="submit" disabled={loading} className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Save Changes
                  </span>
                )}
              </button>
              <button type="button" onClick={() => router.push("/student-profile")} className="py-3.5 px-6 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
