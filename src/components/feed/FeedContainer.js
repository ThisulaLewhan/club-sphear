"use client";

import { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import CreateNotice from "../notices/CreateNotice";
import NoticeBoard from "../notices/NoticeBoard";
import ClubMarquee from "../common/ClubMarquee";
import FeedList from "./FeedList";

export default function FeedContainer({ searchQuery = "" }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [newNotice, setNewNotice] = useState(null);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/posts");

            if (!res.ok) {
                let errMsg = "Failed to fetch posts";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { /* ignore parse error */ }
                throw new Error(errMsg);
            }

            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setPosts(data);
        } catch (err) {
            setError(err.message || "Failed to load feed");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const [creationType, setCreationType] = useState('post');

    const handlePostCreated = (newPost) => {
        // Optimistically add the new post to the top of the feed
        setPosts((currentPosts) => [newPost, ...currentPosts]);
    };

    const handleNoticeCreated = (createdNotice) => {
        setNewNotice(createdNotice);
        setCreationType('post'); // Switch back to post view or just show a success message
    };

    // Filter posts based on the search query from the navbar
    const filteredPosts = posts.filter(post => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (post.content && post.content.toLowerCase().includes(q)) ||
            (post.clubName && post.clubName.toLowerCase().includes(q));
    });

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6 overflow-hidden">
                    <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setCreationType('post')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${creationType === 'post' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-zinc-500 hover:text-zinc-700 bg-zinc-50 dark:bg-zinc-800/20'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            Add Post
                        </button>
                        <button
                            onClick={() => setCreationType('notice')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${creationType === 'notice' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50 dark:bg-amber-900/10' : 'text-zinc-500 hover:text-zinc-700 bg-zinc-50 dark:bg-zinc-800/20'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 4 3-4 3" /><path d="M22 16h-4M22 19h-4" /><path d="m5 11 5-5-5-5" /><path d="m5 21 5-5-5-5" /><path d="M11 6h4" /><path d="M11 16h4" /></svg>
                            Publish Notice
                        </button>
                    </div>

                    {creationType === 'post' ? (
                        <div className="p-2 sm:p-4">
                            <CreatePost onPostCreated={handlePostCreated} />
                        </div>
                    ) : (
                        <div className="p-2 sm:p-4">
                            <CreateNotice onNoticeCreated={handleNoticeCreated} />
                        </div>
                    )}
                </div>
            </div>

            <ClubMarquee />

            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-8 w-full flex flex-col gap-10">
                {/* Notice Board Top Section */}
                <div className="w-full">
                    <NoticeBoard newNotice={newNotice} searchQuery={searchQuery} />
                </div>

                <div className="w-full">
                    <FeedList posts={filteredPosts} isLoading={isLoading} error={error} />
                </div>
            </div>
        </section>
    );
}
