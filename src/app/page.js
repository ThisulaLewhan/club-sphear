"use client";

import { useState } from "react";
import HomeFeed from "@/components/home/HomeFeed";
import EventCalendar from "@/components/events/EventCalendar";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto flex flex-col py-8 px-4 sm:px-6">
        <HomeFeed searchQuery={searchQuery} />

        {/* Unified Event Calendar Section */}
        <div id="calendar-section" className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <h2 className="text-2xl font-black tracking-tight mb-6">Upcoming Campus Events</h2>
          <EventCalendar />
        </div>
      </main>

      <Footer />
    </div>
  );
}