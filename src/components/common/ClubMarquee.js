"use client";

import Link from "next/link";
import Image from "next/image";

export default function ClubMarquee() {
    // Reusing the dummy clubs data for the marquee
    const dummyClubs = [
        { name: "IEEE", category: "Tech", image: "/images/logo-bar/IEEE.png" },
        { name: "AIESEC", category: "Social", image: "/images/logo-bar/aiesec.png" },
        { name: "Architecture Club", category: "Arts", image: "/images/logo-bar/architecture.png" },
        { name: "Engineering Society", category: "Academic", image: "/images/logo-bar/engineering.png" },
        { name: "FCSC", category: "Tech", image: "/images/logo-bar/fcsc.png" },
        { name: "Gaming Club", category: "Entertainment", image: "/images/logo-bar/gaming.png" },
        { name: "Gavel Club", category: "Academic", image: "/images/logo-bar/gavel.png" },
        { name: "Humanities Society", category: "Arts", image: "/images/logo-bar/humanities.png" },
        { name: "Leo Club", category: "Social", image: "/images/logo-bar/leo.png" },
        { name: "Media Unit", category: "Media", image: "/images/logo-bar/mediaunit.png" },
        { name: "Rotaract", category: "Social", image: "/images/logo-bar/rotract.png" },
        { name: "SBSC", category: "Business", image: "/images/logo-bar/sbsc.png" },
        { name: "SEDS", category: "Tech", image: "/images/logo-bar/seds.PNG" },
        { name: "Student Interactive", category: "Social", image: "/images/logo-bar/student interactive.png" },
    ];

    // Duplicate the list so the infinite scroll is seamless
    const marqueeItems = [...dummyClubs, ...dummyClubs];

    return (
        <div className="w-full overflow-hidden bg-white border-y border-zinc-200 dark:border-zinc-800 py-4 mb-8">
            <div className="flex w-[200%] animate-marquee">
                {marqueeItems.map((club, idx) => (
                    <Link
                        key={idx}
                        href="/clubs"
                        className="flex items-center justify-center px-10 md:px-16 shrink-0 group hover:scale-110 transition-transform duration-300"
                    >
                        <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity duration-300">
                            <Image
                                src={club.image}
                                alt={club.name}
                                fill
                                sizes="(max-width: 768px) 96px, 128px"
                                className="object-contain drop-shadow-sm"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
