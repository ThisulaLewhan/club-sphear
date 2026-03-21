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

            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-8 w-full flex flex-col gap-6">
                {/* Tab Buttons */}
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                            activeTab === "posts"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => setActiveTab("notices")}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                            activeTab === "notices"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                    >
                        Notices
                    </button>
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
