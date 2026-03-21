"use client";

// Feature Domain: Student Experience & Public Content


import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 mb-0">
            {/* Two-column hero: Text on left, image on right */}
            <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                
                {/* Left: Text Content */}
                <div className="flex-1 text-center lg:text-left opacity-0-init animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">SLIIT Club Management</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 leading-[1.1] mb-5">
                        Welcome to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                            Club Sphear
                        </span>
                    </h1>

                    <p className="text-lg text-zinc-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                        Your central hub to discover campus events, join exciting student societies, and stay updated with everything happening in the community.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link
                            href="/clubs"
                            className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                            Explore Clubs &amp; Societies
                        </Link>
                        <button
                            onClick={() => document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-7 py-3 rounded-full bg-white hover:bg-zinc-50 text-zinc-700 font-semibold border border-zinc-200 shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                            View Posts
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start opacity-0-init animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div>
                            <p className="text-2xl font-black text-zinc-900">20+</p>
                            <p className="text-xs text-zinc-400 font-medium">Active Clubs</p>
                        </div>
                        <div className="w-px h-8 bg-zinc-200"></div>
                        <div>
                            <p className="text-2xl font-black text-zinc-900">50+</p>
                            <p className="text-xs text-zinc-400 font-medium">Events/Year</p>
                        </div>
                        <div className="w-px h-8 bg-zinc-200"></div>
                        <div>
                            <p className="text-2xl font-black text-zinc-900">1000+</p>
                            <p className="text-xs text-zinc-400 font-medium">Students</p>
                        </div>
                    </div>
                </div>

                {/* Right: Hero Image */}
                <div className="flex-1 relative max-w-lg w-full opacity-0-init animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/40 border border-zinc-200/50">
                        <Image
                            src="/hero-image.png"
                            alt="Club Sphear Community"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Decorative blob behind image */}
                    <div className="absolute -z-10 -top-6 -right-6 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100"></div>
                </div>
            </div>

            {/* Bottom subtle border */}
            <div className="border-b border-zinc-100"></div>
        </section>
    );
}
