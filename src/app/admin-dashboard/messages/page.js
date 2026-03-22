"use client";

// Feature Domain: The Global Admin System

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmModal";

export default function AdminMessagesPage() {
    const { user } = useAuth();
    const toast = useToast();
    const confirm = useConfirm();
    
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && (user.role === "admin" || user.role === "mainAdmin")) {
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin-dashboard/messages");
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            } else {
                toast.error("Failed to load messages.");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const res = await fetch(`/api/admin-dashboard/messages/${id}`, {
                method: "PUT",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Message marked as read.");
                setMessages(messages.map(msg => msg._id === id ? { ...msg, status: "read" } : msg));
            } else {
                toast.error(data.error || "Action failed.");
            }
        } catch (error) {
            console.error("Error marking as read:", error);
            toast.error("Network error.");
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm("Are you sure you want to delete this message? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            const res = await fetch(`/api/admin-dashboard/messages/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Message deleted successfully.");
                setMessages(messages.filter(msg => msg._id !== id));
            } else {
                toast.error(data.error || "Delete failed.");
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Network error.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 font-sans p-8 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 sm:p-12 font-sans">
            <div className="max-w-6xl mx-auto flex flex-col h-full">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contact Submissions</h1>
                        <p className="text-slate-500 mt-2 text-sm max-w-xl leading-relaxed">
                            Review and manage messages submitted via the Contact Us form.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                            {messages.filter(m => m.status === 'unread').length} Unread
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {messages.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-slate-300 opacity-50"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5h11C20 5 22 7 22 9.5Z" /><polyline points="6 12 10 16 18 8" /></svg>
                            <p className="text-lg font-semibold text-slate-700">No messages yet.</p>
                            <p className="text-sm">When users use the Contact form, you'll see them here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`p-6 transition-colors hover:bg-slate-50/50 ${msg.status === 'unread' ? 'bg-indigo-50/20' : ''}`}>
                                    <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                                        
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${msg.status === 'unread' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                        {msg.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-[15px] font-semibold flex items-center gap-2 ${msg.status === 'unread' ? 'text-slate-900' : 'text-slate-700'}`}>
                                                            {msg.name}
                                                            {msg.status === 'unread' && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700">New</span>
                                                            )}
                                                        </h3>
                                                        <a href={`mailto:${msg.email}`} className="text-sm text-slate-500 hover:text-indigo-600 hover:underline">{msg.email}</a>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium shrink-0 ml-4">
                                                    {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className="pl-13 xl:pl-0">
                                                <h4 className="font-semibold text-slate-800 text-sm mb-1">{msg.subject}</h4>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex xl:flex-col gap-2 shrink-0 pt-2 xl:pt-0 border-t border-slate-100 xl:border-none">
                                            {msg.status === 'unread' && (
                                                <button
                                                    onClick={() => handleMarkAsRead(msg._id)}
                                                    className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span className="hidden xl:inline">Mark Read</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                <span className="hidden xl:inline">Delete</span>
                                            </button>
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
