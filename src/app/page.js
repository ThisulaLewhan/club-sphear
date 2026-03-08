"use client";

import { useState } from "react";
import Link from "next/link";
import FeedContainer from "@/components/feed/FeedContainer";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import EventCalendar from "@/components/events/EventCalendar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Navbar Placeholder */}
      {/* Modern Premium Navbar */}
      <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-40 transition-all">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">

          {/* Left: Logo */}
          <div className="flex items-center gap-3 font-bold text-xl group cursor-pointer shrink-0">
            {/* Custom SVG Vector Logo for Club Sphear */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/30 overflow-hidden">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-white mix-blend-overlay opacity-90"
              >
                {/* Central Node */}
                <circle cx="20" cy="20" r="5" fill="currentColor" />
                {/* Orbital Path 1 */}
                <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" />
                {/* Orbital Path 2 */}
                <ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(-45 20 20)" stroke="currentColor" strokeWidth="1.5" />
                {/* Outer Ring */}
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                {/* Connected Nodes */}
                <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                <circle cx="30" cy="30" r="2.5" fill="currentColor" />
                <circle cx="30" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="30" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient font-extrabold tracking-tight hidden sm:block">
              Club Sphear
            </span>
          </div>

          {/* Center: Search Bar (Hidden on very small screens) */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within/search:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clubs, events, or people..."
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Right: Navigation & Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-6 shrink-0">
            {/* Nav Links */}
            <nav className="text-sm font-semibold hidden lg:flex items-center gap-6 mr-2">
              <a href="/" className="text-indigo-600 dark:text-indigo-400 relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400">Home</a>
              <a href="/clubs" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Clubs & Societies</a>
            </nav>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Profile / Action Button */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-zinc-200 dark:border-zinc-800">
              <button className="hidden sm:flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:shadow-md hover:shadow-indigo-500/20 transition-all">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border-2 border-transparent overflow-hidden flex items-center justify-center">
                  <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-500">LM</span>
                </div>
              </button>

              {/* Mobile Menu Button (Hidden on larger screens) */}
              <button className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto flex flex-col py-8 px-4 sm:px-6">
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

        {/* Unified Event Calendar Section */}
        <div id="calendar-section" className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <h2 className="text-2xl font-black tracking-tight mb-6">Upcoming Campus Events</h2>
          <EventCalendar />
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12 bg-white dark:bg-zinc-900">
        <div className="max-w-screen-2xl mx-auto px-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Club Sphear. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
}