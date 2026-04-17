"use client";

// Feature Domain: Student Experience & Public Content


import FeedContainer from "@/components/feed/FeedContainer";

export default function HomeFeed({ searchQuery }) {
    return (
        <div id="feed-section" className="mb-12">
            <FeedContainer searchQuery={searchQuery} />
        </div>
    );
}
