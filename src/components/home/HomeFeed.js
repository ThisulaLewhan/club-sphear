"use client";

import Link from "next/link";
import FeedContainer from "@/components/feed/FeedContainer";

export default function HomeFeed({ searchQuery }) {
    return (
        <>
            {/* Clean Hero Section */}
            <section className="w-full mb-10 mt-4 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20 border border-indigo-100 dark:border-zinc-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none animate-float"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 relative z-10 opacity-0-init animate-fade-in-up">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Club Sphear</span>
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 relative z-10 opacity-0-init animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    Your central hub to discover campus events, join exciting student societies, and stay updated with everything happening in the community.
                </p>
                <div className="flex flex-wrap gap-4 justify-center relative z-10 opacity-0-init animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <Link href="/clubs" className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                        Explore Clubs & Societies
                    </Link>
                    <button
                        onClick={() => document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-6 py-2.5 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                        View Posts
                    </button>
                </div>
            </section>

            {/* Feed Section */}
            <div id="feed-section" className="mb-12">
                <FeedContainer searchQuery={searchQuery} />
            </div>
        </>
    );
}
