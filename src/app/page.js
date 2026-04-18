// Feature Domain: Student Experience & Public Content

import HeroSection from "@/components/home/HeroSection";
import HomeFeed from "@/components/home/HomeFeed";
import EventCalendar from "@/components/events/EventCalendar";

export const metadata = {
  title: "Home \u2014 Discover Clubs & Events",
  description: "Browse club posts, upcoming campus events, and notices from your university's clubs and societies.",
};

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero welcome section — full width */}
      <HeroSection />

      {/* Event Calendar section - Seamless blend with Hero */}
      <section className="relative w-full py-16 lg:py-24 -mt-10 lg:-mt-16 z-20">
        {/* Transitional background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-white dark:via-zinc-900/50 dark:to-zinc-950 -z-10"></div>
        
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="calendar-section" className="relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
                  Event Calendar
                </h2>
                <p className="text-sm font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-[0.2em]">
                  Never Miss A Campus Moment
                </p>
              </div>

              {/* Main Calendar Card with Centered Shadow-Glow */}
              <div className="relative group">
                {/* Refined "Shadow-like" Indigo Glow - strictly behind the card */}
                <div className="absolute inset-0 bg-indigo-600/20 dark:bg-indigo-500/20 rounded-2xl blur-3xl -z-10 transition-all duration-500 group-hover:blur-4xl group-hover:bg-indigo-600/30"></div>
                <div className="absolute -inset-1 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-2xl blur-md -z-10"></div>
                
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-2xl shadow-indigo-900/5 dark:shadow-none transition-all duration-300">
                  <EventCalendar />
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Subtle section divider */}
      <div className="w-full border-t border-zinc-100"></div>

      {/* Feed & Posts section */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeFeed />
      </div>
    </div>
  );
}
