"use client";

import { useState, useEffect } from "react";
import NoticeBoard from "../notices/NoticeBoard";
import ClubMarquee from "../common/ClubMarquee";
import FeedList from "./FeedList";

export default function FeedContainer({ searchQuery = "" }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-8 w-full flex flex-col gap-10">
                {/* Notice Board Top Section */}
                <div className="w-full">
                    <NoticeBoard searchQuery={searchQuery} />
                </div>

                <div className="w-full">
                    <FeedList posts={filteredPosts} isLoading={isLoading} error={error} />
                </div>
            </div>
        </section>
    );
}
