"use client";

// Feature Domain: Student Experience & Public Content

import { useState } from "react";
import Image from "next/image";
import ExpandableCaption from "./ExpandableCaption";
import ImageModal from "./ImageModal";

export default function FeedList({ posts, isLoading, error, isAdmin, onDelete }) {
    const [selectedImage, setSelectedImage] = useState(null);
    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-5 w-full max-w-[750px] mx-auto pb-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-[#edf1f7] dark:border-zinc-800 shadow-sm w-full">
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                            <div className="space-y-2 flex-grow">
                                <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            </div>
                        </div>
                        <div className="px-4 pb-3"><div className="w-full h-5 bg-zinc-200 dark:bg-zinc-800 rounded"></div></div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 aspect-[4/3]"></div>
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
        <>
        <div className="flex flex-col items-center gap-6 w-full max-w-[680px] mx-auto pb-10">
            {posts.map((post) => (
                <article key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100/50 dark:border-zinc-800 shadow-[0_20px_50px_rgba(79,70,229,0.24)] hover:shadow-[0_40px_80px_rgba(79,70,229,0.35)] hover:-translate-y-1 transition-all duration-500 font-sans flex flex-col w-full overflow-hidden">
                    {/* Header: Avatar, Name, Handle & Date */}
                    <div className="flex items-start justify-between p-5 pb-4">
                        <div className="flex items-center gap-3">
                            {/* Blue Avatar (mimicking the screenshot's 'A' logo) */}
                            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner border border-white/20">
                                {post.clubName.charAt(0).toUpperCase()}
                            </div>
 
                            <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-zinc-900 dark:text-zinc-100 text-[16px]">{post.clubName}</span>
                                    {/* Verified Badge - Indigo color to match brand */}
                                    <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-[18px] h-[18px] text-indigo-500 fill-current"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.733 2.73 1.838 3.395-.148.472-.238.973-.238 1.49 0 2.22 1.712 4.015 3.918 4.015.47 0 .92-.086 1.335-.253.522 1.333 1.82 2.25 3.338 2.25s2.815-.918 3.336-2.25c.415.168.865.254 1.336.254 2.21 0 3.918-1.795 3.918-4.014 0-.517-.09-1.018-.237-1.49 1.104-.666 1.837-1.936 1.837-3.396zm-13.847 2.126l-2.616-2.616 1.354-1.354 1.25 1.25 4.708-4.706 1.365 1.355-6.06 6.07z"></path></g></svg>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[13px] font-medium mt-[2px]">
                                    <span>@{post.clubName.toLowerCase().replace(/\s+/g, '')}</span>
                                    <span className="opacity-40">·</span>
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
                                <button className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /><circle cx="5" cy="12" r="1.2" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
 
                    {/* Text Content — expandable */}
                    <div className="px-5 pb-4">
                        <ExpandableCaption content={post.content} />
                    </div>
 
                    {/* Image section — clickable for full view */}
                    {post.image && (
                        <div
                            className="w-full relative overflow-hidden bg-zinc-50 dark:bg-zinc-800 cursor-zoom-in"
                            onClick={() => setSelectedImage({ src: post.image, alt: `Post by ${post.clubName}` })}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.image}
                                alt={`Post by ${post.clubName}`}
                                className="w-full h-auto object-contain max-h-[600px] mx-auto"
                            />
                        </div>
                    )}
                </article>
            ))}
        </div>

        {/* Fullscreen Image Modal */}
        {selectedImage && (
            <ImageModal
                src={selectedImage.src}
                alt={selectedImage.alt}
                onClose={() => setSelectedImage(null)}
            />
        )}
        </>
    );
}