"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import Modal from "@/components/common/Modal";
import JoinClubForm from "@/components/clubs/JoinClubForm";

const dummyClubs = [
    { id: "ieee", name: "IEEE", category: "Technology & Innovation", image: "/images/logo-bar/IEEE.png", cover: "bg-gradient-to-tr from-blue-600 to-indigo-600", description: "The Institute of Electrical and Electronics Engineers is the world's largest technical professional organization dedicated to advancing technology for the benefit of humanity. Join us for workshops, hackathons, and networking with tech leaders." },
    { id: "aiesec", name: "AIESEC", category: "Community & Social", image: "/images/logo-bar/aiesec.png", cover: "bg-gradient-to-tr from-blue-400 to-blue-600", description: "AIESEC is a globally recognized youth-led organization focusing on developing leadership through global exchanges and internships." },
    { id: "architecture-club", name: "Architecture Club", category: "Arts & Humanities", image: "/images/logo-bar/architecture.png", cover: "bg-gradient-to-tr from-stone-500 to-stone-700", description: "A creative space for students passionate about building design, urban planning, and architectural heritage." },
    { id: "engineering-society", name: "Engineering Society", category: "Academic & Professional", image: "/images/logo-bar/engineering.png", cover: "bg-gradient-to-tr from-emerald-500 to-teal-700", description: "Connecting engineering students across disciplines to collaborate on innovative projects and foster professional growth." },
    { id: "fcsc", name: "FCSC", category: "Technology & Innovation", image: "/images/logo-bar/fcsc.png", cover: "bg-gradient-to-tr from-indigo-500 to-purple-600", description: "Faculty of Computing Student Community. Organizing the biggest tech events, code camps, and career fairs for computing students." },
    { id: "gaming-club", name: "Gaming Club", category: "Recreation & Esports", image: "/images/logo-bar/gaming.png", cover: "bg-gradient-to-tr from-violet-500 to-fuchsia-600", description: "For casual and competitive gamers alike! Join our tournaments, game dev workshops, and community game nights." },
    { id: "gavel-club", name: "Gavel Club", category: "Business & Leadership", image: "/images/logo-bar/gavel.png", cover: "bg-gradient-to-tr from-red-500 to-rose-700", description: "An affiliate of Toastmasters International. We help students develop exceptional public speaking and leadership abilities." },
    { id: "humanities-society", name: "Humanities Society", category: "Arts & Humanities", image: "/images/logo-bar/humanities.png", cover: "bg-gradient-to-tr from-amber-500 to-orange-600", description: "Connecting thinkers, writers, and artists. We host open mics, debates, and cultural showcases." },
    { id: "leo-club", name: "Leo Club", category: "Community & Social", image: "/images/logo-bar/leo.png", cover: "bg-gradient-to-tr from-yellow-400 to-yellow-600", description: "Leadership, Experience, Opportunity. Leos discover how they can lead positive change in their communities whilst making new friends and developing skills." },
    { id: "media-unit", name: "Media Unit", category: "Media & Communications", image: "/images/logo-bar/mediaunit.png", cover: "bg-gradient-to-tr from-sky-400 to-blue-600", description: "The official broadcasting and media coverage team. Join us to learn photography, videography, and event coverage." },
    { id: "rotaract", name: "Rotaract", category: "Community & Social", image: "/images/logo-bar/rotract.png", cover: "bg-gradient-to-tr from-pink-500 to-rose-600", description: "Rotaract brings together people to exchange ideas with leaders in the community, develop leadership and professional skills, and have fun through service." },
    { id: "sbsc", name: "SBSC", category: "Business & Leadership", image: "/images/logo-bar/sbsc.png", cover: "bg-gradient-to-tr from-cyan-500 to-cyan-700", description: "SLIIT Business School Student Community. Empowering future entrepreneurs and corporate leaders through networking and workshops." },
    { id: "seds", name: "SEDS", category: "Technology & Innovation", image: "/images/logo-bar/seds.PNG", cover: "bg-gradient-to-tr from-slate-700 to-slate-900", description: "Students for the Exploration and Development of Space. Reach for the stars with our astronomy camps and aerospace projects." },
    { id: "student-interactive", name: "Student Interactive", category: "Community & Social", image: "/images/logo-bar/student interactive.png", cover: "bg-gradient-to-tr from-purple-500 to-indigo-600", description: "The central student interactive society focused on orienting new students and organizing massive university-wide social events." },
];

export default function ClubDetailsPage({ params }) {
    // Unwrap params using React.use() as per Next.js 15+ warnings for dynamic route params
    const resolvedParams = use(params);
    const clubId = resolvedParams.id;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const club = dummyClubs.find(c => c.id === clubId);

    if (!club) {
        notFound();
    }

    const handleJoinSuccess = () => {
        setIsModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fc] dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 pb-20">
            {/* Header / Navbar */}
            <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-40 transition-all">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3 font-bold text-xl group cursor-pointer shrink-0">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg transform transition-all duration-300 group-hover:scale-105 overflow-hidden">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white mix-blend-overlay opacity-90"><circle cx="20" cy="20" r="5" fill="currentColor" /><ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" /><ellipse cx="20" cy="20" rx="14" ry="5" transform="rotate(-45 20 20)" stroke="currentColor" strokeWidth="1.5" /><circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" /></svg>
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] font-extrabold tracking-tight hidden sm:block">
                            Club Sphear
                        </span>
                    </Link>

                    <nav className="text-sm font-semibold hidden lg:flex items-center gap-6 mr-2">
                        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Home</Link>
                        <Link href="/clubs" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Clubs & Societies</Link>
                    </nav>
                </div>
            </header>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Application Submitted Successfuly!
                </div>
            )}

            <main className="flex-1 w-full max-w-screen-xl mx-auto flex flex-col pt-0 sm:pt-6 px-0 sm:px-6">

                {/* Back Button */}
                <div className="px-4 pt-6 sm:px-0 sm:pt-0 mb-4 animate-fade-in-up">
                    <Link href="/clubs" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Back to Clubs
                    </Link>
                </div>

                {/* Cover & Profile Header */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-none sm:rounded-3xl border-y sm:border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>

                    {/* Cover Photo */}
                    <div className={`h-48 sm:h-64 w-full ${club.cover} relative`}>
                        {/* Decorative pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    </div>

                    <div className="px-6 sm:px-10 pb-10 relative flex flex-col">
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-16 sm:-mt-20 mb-6">

                            {/* Profile Picture */}
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-full border-8 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-5xl shadow-lg relative z-10 overflow-hidden">
                                {club.image ? (
                                    <Image src={club.image} alt={club.name} fill className="object-contain p-4" sizes="160px" />
                                ) : (
                                    <span className="text-zinc-400">{club.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* Title & Actions */}
                            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full pt-2">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{club.name}</h1>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                                            {club.category}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                    Join Club
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-2 max-w-3xl">
                            <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">About</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                {club.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Tabs (Just a visual mockup for layout) */}
                <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

                    {/* Left Col: Activity Feed */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">No recent posts</h3>
                            <p className="text-zinc-500 dark:text-zinc-500 max-w-xs">This club hasn't posted anything to their feed yet. Check back later!</p>
                        </div>
                    </div>

                    {/* Right Col: widgets */}
                    <div className="md:col-span-1 flex flex-col gap-6">

                        {/* Executive Committee Widget Mockup */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                                Executive Board
                            </h3>
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            EX
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Student Name</p>
                                            <p className="text-xs text-zinc-500">{['President', 'Secretary', 'Treasurer'][i - 1]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Join Club Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Join ${club.name}`}
            >
                <JoinClubForm
                    club={club}
                    onSuccess={handleJoinSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
