"use client";
import { useState } from "react";

export default function CreatePostForm({ clubName }) {
    const [content, setContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // frontend constraint for post length
        if (content.trim().length === 0) {
            alert("Post content cannot be empty.");
            return;
        }
        if (content.length > 1000) {
            alert("Post content must be under 1000 characters.");
            return;
        }

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, clubName }),
        });

        if (res.ok) {
            setContent("");
            alert("Post created successfully");
            window.location.reload();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded mb-6">
            <textarea
                className="w-full p-2 border rounded"
                placeholder="Write your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                Post
            </button>
        </form>
    );
}