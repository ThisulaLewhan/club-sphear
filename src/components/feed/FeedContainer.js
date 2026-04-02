"use client";

// Feature Domain: Student Experience & Public Content


import { useState, useEffect } from "react";
import NoticeBoard from "../notices/NoticeBoard";
import ClubMarquee from "../common/ClubMarquee";
import FeedList from "./FeedList";

export default function FeedContainer({ searchQuery = "" }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("posts");

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

    // Filter posts based on the search query from the navbar
    const filteredPosts = posts.filter(post => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (post.content && post.content.toLowerCase().includes(q)) ||
            (post.clubName && post.clubName.toLowerCase().includes(q));
    });

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <ClubMarquee />

            <div className="w-full flex flex-col gap-8">
                {/* Modern Pill Navigation Toggle */}
                <div className="flex justify-center items-center">
                    <div className="inline-flex p-1.5 bg-zinc-100/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-[2rem] border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`px-8 py-2.5 rounded-[1.8rem] text-sm font-bold transition-all duration-300 ${
                                activeTab === "posts"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab("notices")}
                            className={`px-8 py-2.5 rounded-[1.8rem] text-sm font-bold transition-all duration-300 ${
                                activeTab === "notices"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            }`}
                        >
                            Notices
                        </button>
                    </div>
                </div>

                {/* Conditional Content */}
                {activeTab === "notices" ? (
                    <div className="w-full">
                        <NoticeBoard searchQuery={searchQuery} />
                    </div>
                ) : (
                    <div className="w-full">
                        <FeedList posts={filteredPosts} isLoading={isLoading} error={error} />
                    </div>
                )}
            </div>
        </section>
    );
}
