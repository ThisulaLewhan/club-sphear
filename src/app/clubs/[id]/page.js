"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Modal from "@/components/common/Modal";
import JoinClubForm from "@/components/clubs/JoinClubForm";

export default function ClubDetailsPage({ params }) {
    // Unwrap params using React.use() as per Next.js 15+ warnings for dynamic route params
    const resolvedParams = use(params);
    const clubId = resolvedParams.id;

    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchClubData = async () => {
            try {
                const res = await fetch(`/api/clubs/${clubId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        notFound();
                    }
                    throw new Error("Failed to fetch club data");
                }
                const data = await res.json();
                if (data.success) {
                    setClub(data.data);
                }
            } catch (error) {
                console.error("Error loading club details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (clubId) fetchClubData();
    }, [clubId]);

    const handleJoinSuccess = () => {
        setIsModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fc] dark:bg-black font-sans pb-20 p-8 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!club) {
        return notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fc] dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 pb-20">


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
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-full border-8 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-5xl text-indigo-500 shadow-lg relative z-10 overflow-hidden">
                                {club.logo ? (
                                    <Image src={club.logo} alt={club.name} fill className="object-contain p-4" sizes="160px" />
                                ) : (
                                    <span className="opacity-80 drop-shadow-sm">{club.name.charAt(0)}</span>
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
                                {club.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

                    {/* Left Col: Activity Feed */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        {club.posts && club.posts.length > 0 ? (
                            club.posts.map((post) => (
                                <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                    <div className="p-5 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {club.logo ? (
                                                <Image src={club.logo} alt={club.name} width={40} height={40} className="rounded-full object-cover" />
                                            ) : (
                                                club.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{club.name}</p>
                                            <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 overflow-hidden">
                                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-full break-words whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {post.image && (
                                        <div className="relative w-full h-80 bg-zinc-100 dark:bg-zinc-800 mt-2">
                                            <Image src={post.image} alt="Post attachment" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">No recent posts</h3>
                                <p className="text-zinc-500 dark:text-zinc-500 max-w-xs">This club hasn't posted anything to their feed yet. Check back later!</p>
                            </div>
                        )}
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
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Member {i}</p>
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
