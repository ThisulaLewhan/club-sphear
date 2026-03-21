"use client";

import { useState } from "react";

export default function ClubCreatePostPage() {
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxWidth = 1080;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                setImagePreview(compressedBase64);
                setError("");
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Content is required.");
            return;
        }

        if (!imagePreview) {
            setError("An image is required to create a post.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, image: imagePreview }),
            });

            if (!res.ok) {
                let errMsg = "Failed to create post";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { }
                throw new Error(errMsg);
            }

            setSuccess(true);
            setContent("");
            setImagePreview(null);
            const fileInput = document.getElementById("post-image-upload");
            if (fileInput) fileInput.value = "";
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Create Post</h1>
                <p className="text-slate-600 text-base">Share an update with your club community. Posts appear on the home feed and your club's public profile.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Post published successfully! It is now visible on the home feed.
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 font-medium text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Post Image *</label>
                        {imagePreview ? (
                            <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Post preview" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        const fileInput = document.getElementById("post-image-upload");
                                        if (fileInput) fileInput.value = "";
                                    }}
                                    className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-10 h-10 mb-3 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    <p className="text-sm text-slate-500"><span className="font-semibold text-emerald-600">Click to upload</span> your image</p>
                                    <p className="text-xs text-slate-400 mt-1">JPEG, PNG or WebP (max 5MB)</p>
                                </div>
                                <input type="file" id="post-image-upload" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
                            </label>
                        )}
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Caption *</label>
                        <textarea
                            placeholder="Write a caption for your post..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{content.length}/500</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                Publish Post
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
