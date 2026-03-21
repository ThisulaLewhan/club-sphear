"use client";

import { useState } from "react";

export default function ClubCreateNoticePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("normal");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/notices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, priority }),
            });

            if (!res.ok) {
                let errMsg = "Failed to create notice";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { }
                throw new Error(errMsg);
            }

            setSuccess(true);
            setTitle("");
            setContent("");
            setPriority("normal");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Create Notice</h1>
                <p className="text-slate-600 text-base">Publish an announcement to the notice board. It will be visible to all students on the home page.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Notice published successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 font-medium text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Notice Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Notice Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. Important Meeting Tomorrow!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-semibold"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Notice Content */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content *</label>
                        <textarea
                            placeholder="What's the announcement about?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Priority Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setPriority("normal")}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${priority === "normal"
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    }`}
                            >
                                🟢 Normal
                            </button>
                            <button
                                type="button"
                                onClick={() => setPriority("urgent")}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${priority === "urgent"
                                        ? "border-red-500 bg-red-50 text-red-700"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    }`}
                            >
                                🔴 Urgent
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                Publish Notice
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
