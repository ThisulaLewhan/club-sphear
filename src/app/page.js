import HeroSection from "@/components/home/HeroSection";
import HomeFeed from "@/components/home/HomeFeed";
import EventCalendar from "@/components/events/EventCalendar";

export default function Home() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto flex flex-col py-8 px-3 sm:px-4 lg:px-6">
      {/* Hero Welcome Section */}
      <HeroSection />

      {/* Event Calendar Section */}
      <div id="calendar-section" className="mt-10 border-t border-zinc-200 pt-10">
        <h2 className="text-2xl font-black tracking-tight mb-6 text-zinc-900">Upcoming Campus Events</h2>
        <EventCalendar />
      </div>

      {/* Feed & Posts Section */}
      <HomeFeed />
    </div>
  );
}
