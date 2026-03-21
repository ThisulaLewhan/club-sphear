// Feature Domain: Student Experience & Public Content

import HeroSection from "@/components/home/HeroSection";
import HomeFeed from "@/components/home/HomeFeed";
import EventCalendar from "@/components/events/EventCalendar";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero welcome section — full width */}
      <HeroSection />

      {/* Event Calendar section */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="calendar-section" className="py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Event Calendar</h2>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <EventCalendar />
          </div>
        </div>
      </div>

      {/* Subtle section divider */}
      <div className="w-full border-t border-zinc-100"></div>

      {/* Feed & Posts section */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeFeed />
      </div>
    </div>
  );
}
