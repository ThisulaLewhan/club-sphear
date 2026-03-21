"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ManagePostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
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
        if (!confirm("Are you sure you want to permanently delete this post? This cannot be undone.")) return;

        try {
            setDeletingId(postId);
            const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.filter(p => p.id !== postId));
            } else {
                alert(data.error || "Failed to delete post");
            }
        } catch (error) {
            alert("An error occurred while deleting.");
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (post) => {
        setEditingId(post.id);
        setEditContent(post.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const saveEdit = async (postId) => {
        try {
            setSavingId(postId);
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent } : p));
                setEditingId(null);
                setEditContent("");
            } else {
                alert(data.error || "Failed to update post");
            }
        } catch (error) {
            alert("An error occurred while saving.");
        } finally {
            setSavingId(null);
        }
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
                                {/* Image thumbnail */}
                                {post.image && (
                                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100">
                                        <Image src={post.image} alt="Post" fill className="object-cover" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        {editingId === post.id ? (
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={3}
                                                maxLength={500}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
                                            />
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
