"use client";

// Feature Domain: Club Management & Operations


import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

export default function ManagePostsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editImage, setEditImage] = useState(null);       // existing image URL or null
    const [editNewFile, setEditNewFile] = useState(null);    // new File to upload
    const [editImageRemoved, setEditImageRemoved] = useState(false);
    const [editError, setEditError] = useState("");
    const [savingId, setSavingId] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/club-dashboard/manage-posts");
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (postId) => {
        const confirmed = await confirm(
            "This will permanently delete this post. This cannot be undone.",
            { title: "Delete Post?", confirmText: "Delete", variant: "danger" }
        );
        if (!confirmed) return;

        try {
            setDeletingId(postId);
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.filter(p => p.id !== postId));
                toast.success("Post deleted successfully.");
            } else {
                toast.error(data.error || "Failed to delete post");
            }
        } catch (error) {
            toast.error("An error occurred while deleting.");
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (post) => {
        setEditingId(post.id);
        setEditContent(post.content);
        setEditImage(post.image || null);
        setEditNewFile(null);
        setEditImageRemoved(false);
        setEditError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent("");
        setEditImage(null);
        setEditNewFile(null);
        setEditImageRemoved(false);
        setEditError("");
    };

    const handleRemoveImage = () => {
        setEditImage(null);
        setEditNewFile(null);
        setEditImageRemoved(true);
    };

    const handleNewImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditNewFile(file);
            setEditImageRemoved(false);
            setEditError("");
        }
    };

    const saveEdit = async (postId) => {
        // Client-side validation
        if (!editContent || !editContent.trim()) {
            setEditError("Caption is required.");
            return;
        }
        const hasImage = editNewFile || (editImage && !editImageRemoved);
        if (!hasImage) {
            setEditError("Image is required. Please upload a photo.");
            return;
        }

        try {
            setSavingId(postId);
            setEditError("");

            const formData = new FormData();
            formData.append("content", editContent);
            if (editImageRemoved) {
                formData.append("removeImage", "true");
            }
            if (editNewFile) {
                formData.append("image", editNewFile);
            }

            const res = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map(p => p.id === postId ? {
                    ...p,
                    content: data.data.content,
                    image: data.data.image
                } : p));
                cancelEdit();
            } else {
                setEditError(data.error || "Failed to update post");
            }
        } catch (error) {
            setEditError("An error occurred while saving.");
        } finally {
            setSavingId(null);
        }
    };

    // Determine what image to show in edit mode
    const getEditPreview = () => {
        if (editNewFile) return URL.createObjectURL(editNewFile);
        if (editImage && !editImageRemoved) return editImage;
        return null;
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Manage Posts</h1>
                <p className="text-slate-600 text-base">View, edit, or delete your club&apos;s published posts.</p>
            </div>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                        <div className="animate-pulse">Loading posts...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No Posts Yet</h3>
                        <p className="text-slate-500 text-sm">Head over to Create Post to publish your first update!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                                {/* Image thumbnail / Edit preview */}
                                {editingId === post.id ? (
                                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100 flex flex-col items-center justify-center">
                                        {getEditPreview() ? (
                                            <>
                                                <Image src={getEditPreview()} alt="Post" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors"
                                                    title="Remove image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2">
                                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                                </svg>
                                                <p className="text-xs text-slate-400">No image</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    post.image && (
                                        <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100">
                                            <Image src={post.image} alt="Post" fill className="object-cover" />
                                        </div>
                                    )
                                )}

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        {editingId === post.id ? (
                                            <>
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => { setEditContent(e.target.value); setEditError(""); }}
                                                    rows={3}
                                                    maxLength={500}
                                                    placeholder="Write a caption..."
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
                                                />

                                                {/* Image upload input */}
                                                <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                    {editNewFile ? "Change image" : "Upload new image"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleNewImage}
                                                    />
                                                </label>
                                                {editNewFile && (
                                                    <p className="text-xs text-slate-500 mt-1 truncate">Selected: {editNewFile.name}</p>
                                                )}

                                                {/* Validation error */}
                                                {editError && (
                                                    <p className="text-sm text-red-500 mt-2 font-medium">{editError}</p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-2">
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Unknown"}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4">
                                        {editingId === post.id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEdit(post.id)}
                                                    disabled={savingId === post.id}
                                                    className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                >
                                                    {savingId === post.id ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="text-sm font-semibold px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(post)}
                                                    className="text-sm font-semibold px-4 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    disabled={deletingId === post.id}
                                                    className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${deletingId === post.id
                                                            ? "text-slate-400 cursor-not-allowed"
                                                            : "text-red-600 hover:bg-red-50"
                                                        }`}
                                                >
                                                    {deletingId === post.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

