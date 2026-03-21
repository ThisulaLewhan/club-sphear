"use client";

import { useState } from "react";

export default function CreateNotice({ onNoticeCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("normal");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/notices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    club: "Club Sphear", // TODO: hook up to real club data
                    priority,
                    author: "Club Admin" // TODO: hook up to real user data
                }),
            });

            if (!res.ok) {
                let errMsg = "Failed to create notice";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { /* couldn't parse json, just ignore it */ }
                throw new Error(errMsg);
            }

            const text = await res.text();
            const newNotice = text ? JSON.parse(text) : {};

            if (newNotice && newNotice._id && onNoticeCreated) {
                onNoticeCreated(newNotice);
            }

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 pt-4">
            {error && (
                <div className="mb-2 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Notice Title (e.g., Important Meeting!)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow font-semibold"
                    disabled={isSubmitting}
                />
            </div>


            <textarea
                placeholder="What's the announcement?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none"
                disabled={isSubmitting}
            />

            <div className="flex justify-end items-center mt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-amber-600/20"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Publishing...
                        </>
                    ) : (
                        "Publish Notice"
                    )}
                </button>
            </div>
        </form>
    );
}
