"use client";

import { useState } from "react";

export default function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Create an image element to draw and compress it
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxWidth = 1080; // Max width for feed images

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Compress image down to 0.7 quality to guarantee it fits under Next.js 4MB payload limit
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

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    clubName: "Club Sphear", // Hardcoded for now
                    image: imagePreview
                }),
            });

            if (!res.ok) {
                let errMsg = "Failed to create post";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { /* ignore parse error */ }
                throw new Error(errMsg);
            }

            const text = await res.text();
            const newPost = text ? JSON.parse(text) : {};

            // Only update feed if we actually got a newly created post object back
            if (newPost && newPost._id) {
                onPostCreated(newPost);
            }

            setContent("");
            setImagePreview(null);
            // Reset file input
            const fileInput = document.getElementById("image-upload");
            if (fileInput) fileInput.value = "";
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-2 sm:p-4 pt-2">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {imagePreview && (
                    <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imagePreview}
                            alt="Post preview"
                            className="object-cover w-full h-full"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setImagePreview(null);
                                const fileInput = document.getElementById("image-upload");
                                if (fileInput) fileInput.value = "";
                            }}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <textarea
                    placeholder="Caption?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                    disabled={isSubmitting}
                />

                <div className="flex justify-between items-center mt-2">
                    <div className="relative">
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                            className="hidden"
                        />
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                            Add Image
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Posting...
                            </>
                        ) : (
                            "Post"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
