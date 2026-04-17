"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 mb-0 overflow-hidden">
            {/* Split Backgrounds */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-[55%] bg-slate-50 dark:bg-zinc-950 z-0"></div>
            <div className="absolute inset-y-0 right-0 w-full lg:w-[45%] bg-indigo-50/60 dark:bg-zinc-900 z-0"></div>

            {/* Seamless Bottom Fade to White */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white dark:to-zinc-950 z-[5]"></div>

            {/* Massive Unified Glow spanning from image to text - Vertical Spread Reduced */}
            <div className="absolute top-[45%] left-[60%] lg:left-[55%] -translate-x-1/2 -translate-y-1/2 w-[800px] lg:w-[1200px] h-[400px] lg:h-[550px] rounded-full bg-gradient-to-l from-indigo-300 to-purple-300 dark:from-indigo-900 dark:to-purple-900 opacity-60 blur-[100px] lg:blur-[140px] pointer-events-none z-0"></div>

            {/* Decorative Background Elements */}
            <div className="absolute top-20 left-[45%] w-4 h-4 rounded-full border-[3px] border-indigo-400/40 hidden lg:block z-0 animate-pulse"></div>
            <div className="absolute bottom-32 left-[50%] w-6 h-6 rounded-full border-[3px] border-purple-400/40 hidden lg:block z-0"></div>
            <div className="absolute top-40 right-[15%] w-5 h-5 rounded-full border-[3px] border-blue-400/50 hidden lg:block z-0"></div>
            <div className="absolute top-[30%] left-[8%] w-3 h-3 rounded-full bg-orange-400/30 hidden lg:block z-0"></div>

            {/* Paper Plane Trace SVG */}
            <svg className="absolute left-[38%] top-[25%] opacity-50 hidden xl:block z-0 text-indigo-400 dark:text-zinc-600" width="250" height="250" viewBox="0 0 250 250" fill="none">
                <path d="M10 240 C 30 200, 80 150, 100 100 C 120 50, 180 30, 240 10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 8" />
                <path d="M240 10 L220 30 L235 45 Z" fill="currentColor" opacity="0.8" />
            </svg>

            <div className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                
                {/* Left: Text Content */}
                <div className="flex-1 text-center lg:text-left opacity-0-init animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[5rem] font-black tracking-tight text-zinc-900 dark:text-white leading-[1.05] mb-6">
                        Welcome to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Club Sphear
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
                        Your central hub to discover campus events, join exciting student societies, and stay updated with everything happening in the community.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link
                            href="/clubs"
                            className="px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-[0_8px_30px_rgb(79,70,229,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Explore Clubs &amp; Societies
                        </Link>
                        <button
                            onClick={() => document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-3.5 rounded-full bg-white dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-bold border border-zinc-200 hover:border-indigo-300 dark:border-zinc-700 shadow-sm transition-all hover:-translate-y-1 active:scale-95"
                        >
                            View Posts
                        </button>
                    </div>
                </div>

                {/* Right: Hero Image with Overlay Cards */}
                <div className="flex-1 relative w-full max-w-[480px] lg:max-w-none lg:w-[45%] xl:w-1/2 opacity-0-init animate-fade-in-up mt-10 lg:mt-0" style={{ animationDelay: '150ms' }}>
                    
                    {/* Main Image Base */}
                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/20 z-10 border-4 border-white/50 dark:border-zinc-800/50">
                        <Image
                            src="/hero-image.png"
                            alt="Club Sphear Community"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    
                    {/* Floating Card 1: Students */}
                    <div className="absolute top-[8%] -right-4 sm:-right-8 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 px-6 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Students</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">1000+</p>
                        </div>
                    </div>

                    {/* Floating Card 2: Active Clubs */}
                    <div className="absolute bottom-[20%] -left-4 sm:-left-10 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 px-6 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Active Clubs</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">20+</p>
                        </div>
                    </div>

                    {/* Floating Card 3: Events/Year (Colored Card) */}
                    <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 z-30 bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-2xl shadow-indigo-600/40 text-white transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-widest">Yearly Action</p>
                            <svg className="w-5 h-5 opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        </div>
                        <p className="text-3xl font-black mb-1">50+</p>
                        <p className="text-sm font-medium text-indigo-100">Events Every Year</p>
                        
                        <div className="flex gap-1.5 mt-4">
                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                            <div className="w-8 h-8 rounded-full bg-white/20 -ml-4"></div>
                        </div>
                    </div>

                </div>
            </div>
            
        </section>
    );
}
