"use client";

// Feature Domain: Club Management & Operations

import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

// ── Create Post Tab ───────────────────────────────────────────────────────────
function CreatePostTab() {
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB"); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width, height = img.height;
                const maxWidth = 1080;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                setImagePreview(canvas.toDataURL("image/jpeg", 0.7));
                setError("");
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) { setError("Caption is required."); return; }
        if (content.length > 1000) { setError("Post content must be under 1000 characters."); return; }
        if (!imagePreview) { setError("An image is required to create a post."); return; }
        setIsSubmitting(true); setError(""); setSuccess(false);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, image: imagePreview }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to create post");
            }
            setSuccess(true); setContent(""); setImagePreview(null);
            const fi = document.getElementById("post-image-upload");
            if (fi) fi.value = "";
        } catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
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
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Post Image *</label>
                    {imagePreview ? (
                        <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Post preview" className="object-cover w-full h-full" />
                            <button type="button" onClick={() => { setImagePreview(null); const fi = document.getElementById("post-image-upload"); if (fi) fi.value = ""; }} className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-red-500 transition-colors">
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
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Caption *</label>
                    <textarea placeholder="Write a caption for your post..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} maxLength={500} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none" disabled={isSubmitting} />
                    <p className="text-xs text-slate-400 mt-1 text-right">{content.length}/500</p>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                    {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Publishing...</> : <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                        Publish Post
                    </>}
                </button>
            </form>
        </div>
    );
}

// ── Manage Posts Tab ──────────────────────────────────────────────────────────
function ManagePostsTab() {
    const toast = useToast();
    const confirm = useConfirm();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editNewFile, setEditNewFile] = useState(null);
    const [editImageRemoved, setEditImageRemoved] = useState(false);
    const [editError, setEditError] = useState("");
    const [savingId, setSavingId] = useState(null);

    const fetchPosts = async () => {
        try { setLoading(true); const res = await fetch("/api/club-dashboard/manage-posts"); const data = await res.json(); if (data.success) setPosts(data.data); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (postId) => {
        const confirmed = await confirm("This will permanently delete this post.", { title: "Delete Post?", confirmText: "Delete", variant: "danger" });
        if (!confirmed) return;
        try { setDeletingId(postId); const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { setPosts(posts.filter(p => p.id !== postId)); toast.success("Post deleted."); } else { toast.error(data.error || "Failed to delete post"); } } catch { toast.error("An error occurred."); } finally { setDeletingId(null); }
    };

    const startEdit = (post) => { setEditingId(post.id); setEditContent(post.content); setEditImage(post.image || null); setEditNewFile(null); setEditImageRemoved(false); setEditError(""); };
    const cancelEdit = () => { setEditingId(null); setEditContent(""); setEditImage(null); setEditNewFile(null); setEditImageRemoved(false); setEditError(""); };
    const handleRemoveImage = () => { setEditImage(null); setEditNewFile(null); setEditImageRemoved(true); };
    const handleNewImage = (e) => { const file = e.target.files?.[0]; if (file) { setEditNewFile(file); setEditImageRemoved(false); setEditError(""); } };
    const getEditPreview = () => { if (editNewFile) return URL.createObjectURL(editNewFile); if (editImage && !editImageRemoved) return editImage; return null; };

    const saveEdit = async (postId) => {
        if (!editContent?.trim()) { setEditError("Caption is required."); return; }
        if (!(editNewFile || (editImage && !editImageRemoved))) { setEditError("Image is required."); return; }
        try {
            setSavingId(postId); setEditError("");
            const fd = new FormData(); fd.append("content", editContent);
            if (editImageRemoved) fd.append("removeImage", "true");
            if (editNewFile) fd.append("image", editNewFile);
            const res = await fetch(`/api/posts/${postId}`, { method: "PUT", body: fd });
            const data = await res.json();
            if (data.success) { setPosts(posts.map(p => p.id === postId ? { ...p, content: data.data.content, image: data.data.image } : p)); cancelEdit(); } else { setEditError(data.error || "Failed to update post"); }
        } catch { setEditError("An error occurred while saving."); } finally { setSavingId(null); }
    };

    if (loading) return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 animate-pulse">Loading posts...</div>;
    if (posts.length === 0) return (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Posts Yet</h3>
            <p className="text-slate-500 text-sm">Switch to Create Post to publish your first update!</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                        {editingId === post.id ? (
                            <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100 flex flex-col items-center justify-center">
                                {getEditPreview() ? (
                                    <><Image src={getEditPreview()} alt="Post" fill className="object-cover" />
                                        <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button></>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                        <p className="text-xs text-slate-400">No image</p>
                                    </div>
                                )}
                            </div>
                        ) : (post.image && <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100"><Image src={post.image} alt="Post" fill className="object-cover" /></div>)}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                                {editingId === post.id ? (
                                    <>
                                        <textarea value={editContent} onChange={(e) => { setEditContent(e.target.value); setEditError(""); }} rows={3} maxLength={500} placeholder="Write a caption..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm" />
                                        <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                            {editNewFile ? "Change image" : "Upload new image"}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleNewImage} />
                                        </label>
                                        {editNewFile && <p className="text-xs text-slate-500 mt-1 truncate">Selected: {editNewFile.name}</p>}
                                        {editError && <p className="text-sm text-red-500 mt-2 font-medium">{editError}</p>}
                                    </>
                                ) : (<p className="text-slate-700 text-sm leading-relaxed line-clamp-3">{post.content}</p>)}
                                <p className="text-xs text-slate-400 mt-2">{post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {editingId === post.id ? (
                                    <>
                                        <button onClick={() => saveEdit(post.id)} disabled={savingId === post.id} className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">{savingId === post.id ? "Saving..." : "Save"}</button>
                                        <button onClick={cancelEdit} className="text-sm font-semibold px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(post)} className="text-sm font-semibold px-4 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id} className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${deletingId === post.id ? "text-slate-400 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}>{deletingId === post.id ? "Deleting..." : "Delete"}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PostsPage() {
    const [tab, setTab] = useState("create");

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Posts</h1>
                <p className="text-slate-500 text-base">Create and manage your club&apos;s posts.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setTab("create")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "create" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    + Create Post
                </button>
                <button
                    onClick={() => setTab("manage")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === "manage" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Manage Posts
                </button>
            </div>

            {tab === "create" ? <CreatePostTab /> : <ManagePostsTab />}
        </div>
    );
}
