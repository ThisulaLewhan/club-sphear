"use client";
import Image from "next/image";

export default function FeedList({ posts, isLoading, error, isAdmin, onDelete }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-[#edf1f7] dark:border-zinc-800 p-5 shadow-sm mt-0 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                            <div className="space-y-2 flex-grow">
                                <div className="w-full max-w-[120px] h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            </div>
                        </div>
                        <div className="w-full h-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
                        <div className="w-full flex-grow mt-auto bg-zinc-200 dark:bg-zinc-800 rounded-xl min-h-[200px]"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full text-center py-10 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                <p className="font-medium">Failed to load feed</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="w-full text-center py-16 bg-[#f8f9fc] dark:bg-zinc-900 rounded-2xl border border-[#edf1f7] dark:border-zinc-800 text-zinc-500">
                <p>No posts yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
            {posts.map((post) => (
                <article key={post._id} className="bg-[#fcfdff] dark:bg-zinc-900 rounded-2xl border border-[#edf1f7] dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-shadow font-sans flex flex-col h-full">
                    {/* Header: Avatar, Name, Handle & Date */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {/* Blue Avatar (mimicking the screenshot's 'A' logo) */}
                            <div className="w-12 h-12 shrink-0 rounded-full bg-[#7C5DFF] text-white flex items-center justify-center font-bold text-xl shadow-inner border-2 border-white dark:border-zinc-900">
                                {post.clubName.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-[#1e293b] dark:text-zinc-100 text-[15px]">{post.clubName}</span>
                                    {/* Verified Badge */}
                                    <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-[18px] h-[18px] text-[#0ea5e9] fill-current" data-testid="icon-verified"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.733 2.73 1.838 3.395-.148.472-.238.973-.238 1.49 0 2.22 1.712 4.015 3.918 4.015.47 0 .92-.086 1.335-.253.522 1.333 1.82 2.25 3.338 2.25s2.815-.918 3.336-2.25c.415.168.865.254 1.336.254 2.21 0 3.918-1.795 3.918-4.014 0-.517-.09-1.018-.237-1.49 1.104-.666 1.837-1.936 1.837-3.396zm-13.847 2.126l-2.616-2.616 1.354-1.354 1.25 1.25 4.708-4.706 1.365 1.355-6.06 6.07z"></path></g></svg>
                                </div>
                                <div className="flex items-center gap-1 text-[#64748b] dark:text-zinc-400 text-[13px] mt-[2px]">
                                    <span>@{post.clubName.toLowerCase().replace(/\s+/g, '')}</span>
                                    <span>·</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }).toLowerCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Three dots menu */}
                        <div className="flex items-center">
                            {isAdmin && onDelete ? (
                                <button
                                    onClick={() => onDelete(post._id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                    title="Delete Post"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            ) : (
                                <button className="p-2 text-[#0ea5e9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="mb-3 text-[15px] leading-relaxed text-[#475569] dark:text-zinc-300 font-normal">
                        {post.content}
                    </div>

                    {/* Image section  */}
                    {post.image && (
                        <div className="w-full relative rounded-[14px] overflow-hidden border border-[#edf1f7] dark:border-zinc-800 bg-[#7C5DFF]/10 mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.image}
                                alt={`Post by ${post.clubName}`}
                                className="w-full h-auto max-h-[600px] object-cover"
                                style={{
                                    // Make images gracefully handle missing source if something breaks
                                    minHeight: '200px'
                                }}
                            />
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}