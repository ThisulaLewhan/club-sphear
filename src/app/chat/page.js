"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

function ChatApp() {
    const { user } = useAuth();
    const toast = useToast();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [contextMenu, setContextMenu] = useState(null); // { msgId, x, y }
    const [editingMsg, setEditingMsg] = useState(null);   // { id, content }
    const [editContent, setEditContent] = useState("");
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeletingChat, setIsDeletingChat] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const headerMenuRef = useRef(null);
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [lightboxImage, setLightboxImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showTyping, setShowTyping] = useState(false);
    const dragCounter = useRef(0);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const docInputRef = useRef(null);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chat/conversations");
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
                // Also update activeConversation reference to ensure header stays fresh
                if (activeConversation) {
                    const updatedActive = data.conversations.find(c => c._id === activeConversation._id);
                    // Only update if something actually changed to avoid unnecessary re-renders
                    if (updatedActive && JSON.stringify(updatedActive) !== JSON.stringify(activeConversation)) {
                        setActiveConversation(updatedActive);
                    }
                }
            }
        } catch (error) {
            console.error("FetchConversations Error:", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(`/api/chat/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.results);
                }
            } catch (error) {
                console.error(error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchMessages = async (convId) => {
        try {
            const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data.messages)) return data.messages;
                    return prev;
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!activeConversation) return;
        fetchMessages(activeConversation._id);
        const interval = setInterval(() => {
            fetchMessages(activeConversation._id);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        function handleClick(e) {
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setShowHeaderMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setSearchQuery("");
    };

    const handleStartNewChat = async (clubUser) => {
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: clubUser._id }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchConversations();
                setActiveConversation(data.conversation);
                setSearchQuery("");
            } else {
                toast.error("Failed to start chat");
            }
        } catch (error) {
            toast.error("Error starting chat");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be less than 5MB");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { toast.error("File must be less than 10MB"); return; }
            setSelectedFile(file);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (docInputRef.current) docInputRef.current.value = "";
    };

    const handleDeleteConversation = async () => {
        if (!activeConversation || isDeletingChat) return;
        setIsDeletingChat(true);
        try {
            const res = await fetch(`/api/chat/conversations?conversationId=${activeConversation._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Conversation deleted");
                setActiveConversation(null);
                setMessages([]);
                setShowDeleteConfirm(false);
                await fetchConversations();
            } else {
                toast.error(data.message || "Failed to delete conversation");
            }
        } catch (error) {
            toast.error("Error deleting conversation");
        } finally {
            setIsDeletingChat(false);
        }
    };

    const sendMessageContent = async (text, image = null, previewUrl = null, file = null) => {
        if ((!text.trim() && !image && !file) || !activeConversation) return;

        const optimisticId = "temp-" + Date.now();
        const optimisticMessage = {
            _id: optimisticId,
            sender: user.id || user._id,
            content: text,
            imageUrl: previewUrl,
            fileName: file?.name || null,
            fileType: file?.type || null,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const formData = new FormData();
            formData.append("conversationId", activeConversation._id);
            formData.append("content", text);
            if (image) formData.append("image", image);
            if (file) formData.append("file", file);

            const res = await fetch("/api/chat/messages", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!data.success) {
                toast.error("Failed to send message");
                fetchMessages(activeConversation._id);
            } else {
                fetchConversations();
            }
        } catch (error) {
            toast.error("Error sending message");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage && !selectedFile) || !activeConversation) return;

        const contentToSend = newMessage;
        const imageToSend = selectedImage;
        const previewToSend = imagePreview;
        const fileToSend = selectedFile;
        setNewMessage("");
        clearSelectedImage();
        clearSelectedFile();

        setIsSending(true);
        setTimeout(() => setIsSending(false), 250);
        setTimeout(() => setShowTyping(true), 800);
        setTimeout(() => setShowTyping(false), 2500);

        await sendMessageContent(contentToSend, imageToSend, previewToSend, fileToSend);
    };

    const handleSendSuggestion = async (text) => {
        await sendMessageContent(text);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.txt')) {
            if (file.size > 10 * 1024 * 1024) { toast.error("File must be less than 10MB"); return; }
            setSelectedFile(file);
        } else {
            toast.error("Unsupported file type. Use images, PDFs, or documents.");
        }
    };

    const renderMessageContent = (content, isMe = false) => {
        if (!content) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline break-all ${isMe ? 'text-indigo-200 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const getPartner = (conv) => {
        if (!conv || !conv.participants) return null;
        return conv.participants.find(p => p._id !== (user.id || user._id)) || conv.participants[0];
    };

    const getAvatarColor = (name) => {
        const palettes = [
            'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
            'bg-blue-500', 'bg-teal-500', 'bg-violet-500', 'bg-cyan-500',
        ];
        const idx = (name?.charCodeAt(0) || 0) % palettes.length;
        return palettes[idx];
    };

    const formatMessageDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    const handleContextMenu = (e, msg) => {
        const isMe = msg.sender === (user.id || user._id);
        if (!isMe || msg.isDeleted) return;
        e.preventDefault();
        setContextMenu({ msgId: msg._id, x: e.clientX, y: e.clientY, msg });
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleStartEdit = (msg) => {
        setEditingMsg(msg);
        setEditContent(msg.content);
        closeContextMenu();
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || !editingMsg) return;
        try {
            const res = await fetch("/api/chat/messages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: editingMsg._id, content: editContent }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m._id === editingMsg._id ? data.message : m));
                setEditingMsg(null);
                setEditContent("");
            } else {
                toast.error(data.message || "Failed to edit message");
            }
        } catch { toast.error("Error editing message"); }
    };

    const handleDeleteMsg = async (msgId) => {
        closeContextMenu();
        try {
            const res = await fetch(`/api/chat/messages?messageId=${msgId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m._id === msgId ? data.message : m));
            } else {
                toast.error(data.message || "Failed to delete message");
            }
        } catch { toast.error("Error deleting message"); }
    };

    return (
        <div className="h-[100dvh] w-full flex overflow-hidden font-sans bg-slate-100">

            {/* ── Sidebar ── */}
            <div className={`w-full sm:w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0 ${activeConversation ? 'hidden sm:flex' : 'flex'}`}>

                {/* Sidebar header */}
                <div className="px-4 py-4 bg-gradient-to-br from-indigo-600 to-purple-700 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/student-profile" className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <div>
                            <h2 className="font-bold text-white text-base leading-tight">Messages</h2>
                            {conversations.length > 0 && (
                                <p className="text-indigo-200 text-[11px] mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                            )}
                        </div>
                    </div>
                    {/* Search inside header */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search clubs…"
                            className="w-full pl-8 pr-8 py-2 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/60 focus:bg-white/25 focus:outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat / search list */}
                <div className="flex-1 overflow-y-auto">
                    {isSearching ? (
                        <>
                            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">Clubs</div>
                            {searchResults.length > 0 ? searchResults.map(club => (
                                <div key={club._id} onClick={() => handleStartNewChat(club)} className="px-4 py-3 hover:bg-indigo-50/60 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50">
                                    <div className={`w-10 h-10 rounded-2xl ${getAvatarColor(club.name)} overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                        {club.logo ? <img src={club.logo} alt={club.name} className="w-full h-full object-cover" /> : club.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-800 text-sm truncate">{club.name}</h3>
                                        <p className="text-[11px] text-indigo-500 font-medium flex items-center gap-1 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                            Start conversation
                                        </p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 shrink-0"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </div>
                            )) : (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-slate-400">No clubs found for</p>
                                    <p className="text-sm font-semibold text-slate-600 mt-0.5">&quot;{searchQuery}&quot;</p>
                                </div>
                            )}
                        </>
                    ) : conversations.length > 0 ? (
                        conversations.map(conv => {
                            const partner = getPartner(conv);
                            const isActive = activeConversation?._id === conv._id;
                            const hasUnread = conv.unreadCount > 0 && !isActive;
                            const lastMsg = conv.lastMessage;
                            const preview = lastMsg
                                ? lastMsg.isDeleted ? 'Message deleted'
                                    : lastMsg.imageUrl && !lastMsg.content ? '📷 Photo'
                                    : lastMsg.content
                                : 'Start chatting!';
                            return (
                                <div key={conv._id} onClick={() => handleSelectConversation(conv)}
                                    className={`px-4 py-3.5 cursor-pointer flex items-center gap-3 transition-all border-b border-slate-50
                                        ${isActive ? 'bg-indigo-50 border-l-[3px] border-l-indigo-500' : 'hover:bg-slate-50/80 border-l-[3px] border-l-transparent'}`}>
                                    <div className={`relative w-11 h-11 rounded-2xl ${getAvatarColor(partner?.name)} overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                                        {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0) || "?"}
                                        {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className={`truncate text-sm ${hasUnread ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}>{partner?.name || "Unknown"}</h3>
                                            {conv.updatedAt && <span className={`text-[10px] whitespace-nowrap ml-2 shrink-0 ${hasUnread ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                            <p className={`text-xs truncate ${lastMsg?.isDeleted ? 'italic text-slate-400' : hasUnread ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{preview}</p>
                                            {hasUnread && (
                                                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 mb-1">No messages yet</p>
                                <p className="text-xs text-slate-400 leading-relaxed">Search for a club above to start a conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main chat area ── */}
            <div className={`flex-1 flex flex-col relative min-w-0 ${!activeConversation ? 'hidden sm:flex' : 'flex'}`}
                 onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>

                {/* Drag-and-drop overlay */}
                {isDragging && activeConversation && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-modal-backdrop">
                        <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-indigo-400 rounded-3xl animate-drop-zone">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <p className="text-sm font-semibold text-indigo-600">Drop file here</p>
                            <p className="text-xs text-slate-400">Images, PDFs & documents</p>
                        </div>
                    </div>
                )}

                {!activeConversation ? (
                    /* No-conversation placeholder */
                    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 bg-slate-50">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200 animate-float">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-700 mb-1.5">Club Connect</h2>
                            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Pick a conversation or search for a club to start chatting with their team.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between relative z-30 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button className="sm:hidden p-1.5 -ml-1 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors active:scale-95" onClick={() => setActiveConversation(null)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                {(() => {
                                    const partner = getPartner(activeConversation);
                                    return (
                                        <>
                                            <div className={`w-10 h-10 rounded-2xl ${getAvatarColor(partner?.name)} overflow-hidden flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}>
                                                {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-slate-800 text-sm leading-tight">{partner?.name || "Unknown"}</h2>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Header ⋮ menu */}
                            <div className="relative" ref={headerMenuRef}>
                                <button
                                    onClick={() => setShowHeaderMenu(v => !v)}
                                    className={`p-2 rounded-xl transition-colors active:scale-95 ${showHeaderMenu ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                </button>
                                {showHeaderMenu && (
                                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-48 py-1">
                                        <button
                                            onClick={() => { setShowHeaderMenu(false); setShowDeleteConfirm(true); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            Delete Conversation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages area */}
                        <div
                            className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 flex flex-col scroll-smooth"
                            style={{
                                background: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0), linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)`,
                                backgroundSize: "24px 24px, 100% 100%"
                            }}
                            onClick={closeContextMenu}
                        >
                            {/* Empty conversation state */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                    {(() => {
                                        const partner = getPartner(activeConversation);
                                        return (
                                            <div className={`w-20 h-20 rounded-3xl ${getAvatarColor(partner?.name)} flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden`}>
                                                {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0) || "?"}
                                            </div>
                                        );
                                    })()}
                                    <div className="text-center">
                                        <p className="font-bold text-slate-700 text-base">{getPartner(activeConversation)?.name || "Club"}</p>
                                        <p className="text-xs text-slate-400 mt-1">Send a message to start the conversation</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isMe = msg.sender === (user.id || user._id);
                                const isEditing = editingMsg?._id === msg._id;
                                const prevMsg = messages[index - 1];
                                const nextMsg = messages[index + 1];
                                const isConsecutive = prevMsg && prevMsg.sender === msg.sender && !prevMsg.isDeleted && !msg.isDeleted;
                                const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || msg.isDeleted || nextMsg.isDeleted;
                                const showDateSeparator = !prevMsg || formatMessageDate(msg.createdAt) !== formatMessageDate(prevMsg.createdAt);

                                const bubbleShape = msg.isDeleted
                                    ? 'rounded-2xl'
                                    : isConsecutive
                                        ? (isMe ? 'rounded-2xl rounded-tr-lg' : 'rounded-2xl rounded-tl-lg')
                                        : isMe ? 'rounded-2xl rounded-tr-[4px]' : 'rounded-2xl rounded-tl-[4px]';

                                const bubbleColor = msg.isDeleted
                                    ? 'bg-white/80 border border-slate-200 text-slate-400 backdrop-blur-sm'
                                    : isMe
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200/50'
                                        : 'bg-white text-slate-800 border border-slate-100/80 shadow-sm';

                                return (
                                    <div key={msg._id || index}>
                                        {showDateSeparator && msg.createdAt && (
                                            <div className="flex items-center gap-3 my-6 animate-msg-slide-up">
                                                <div className="flex-1 h-px bg-slate-200/70"/>
                                                <span className="text-[11px] text-slate-400 font-semibold px-3 py-1 bg-white/90 border border-slate-200 rounded-full whitespace-nowrap shadow-sm">
                                                    {formatMessageDate(msg.createdAt)}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-200/70"/>
                                            </div>
                                        )}
                                        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} group ${isConsecutive ? 'mt-0.5' : 'mt-3'} ${isMe ? 'animate-msg-slide-left' : 'animate-msg-slide-right'}`}
                                             style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}>
                                            {/* ⋮ message menu */}
                                            {isMe && !msg.isDeleted && !isEditing && (
                                                <div className="relative shrink-0 mb-1 order-first">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu?.msgId === msg._id ? null : { msgId: msg._id, x: 0, y: 0, msg, inline: true }); }}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                                        style={{ opacity: contextMenu?.msgId === msg._id ? 1 : undefined }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                                    </button>
                                                    {contextMenu?.msgId === msg._id && contextMenu?.inline && (
                                                        <div className="absolute bottom-full right-0 mb-1.5 z-50 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-36 py-1" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => handleStartEdit(contextMenu.msg)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                                Edit
                                                            </button>
                                                            <div className="h-px bg-slate-100 mx-3"/>
                                                            <button onClick={() => handleDeleteMsg(contextMenu.msgId)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                                className={`max-w-[65%] sm:max-w-[55%] px-4 py-2.5 relative text-[14.5px] select-none ${bubbleShape} ${bubbleColor} hover:shadow-md transition-shadow duration-200`}
                                            >
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <textarea
                                                            autoFocus maxLength={200} rows={2}
                                                            className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                                                                if (e.key === 'Escape') { setEditingMsg(null); setEditContent(""); }
                                                            }}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditingMsg(null); setEditContent(""); }} className="text-xs px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                                                            <button onClick={handleSaveEdit} className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {msg.isDeleted ? (
                                                            <p className="flex items-center gap-1.5 text-[13px] italic py-0.5">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                                This message was deleted
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {msg.imageUrl && (
                                                                        <div className="rounded-xl overflow-hidden -mx-0.5">
                                                                            <img src={msg.imageUrl} alt="Sent in chat" className="max-w-full max-h-[260px] object-contain cursor-pointer hover:opacity-90 transition-opacity" onClick={(e) => { e.stopPropagation(); setLightboxImage(msg.imageUrl); }} />
                                                                            <a href={msg.imageUrl?.includes('/upload/') ? msg.imageUrl.replace('/upload/', '/upload/fl_attachment/') : msg.imageUrl} download onClick={(e) => e.stopPropagation()} className={`flex items-center gap-1.5 mt-1 text-[11px] font-medium ${isMe ? 'text-indigo-200 hover:text-white' : 'text-indigo-500 hover:text-indigo-700'} transition-colors`}>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                                                Download
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {msg.fileUrl && (
                                                                        <a href={msg.fileUrl} onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            try {
                                                                                const res = await fetch(msg.fileUrl);
                                                                                const blob = await res.blob();
                                                                                const url = window.URL.createObjectURL(blob);
                                                                                const a = document.createElement('a');
                                                                                a.href = url;
                                                                                a.download = msg.fileName || 'download';
                                                                                a.click();
                                                                                window.URL.revokeObjectURL(url);
                                                                            } catch (err) {
                                                                                window.open(msg.fileUrl, '_blank');
                                                                            }
                                                                        }}
                                                                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${isMe ? 'border-indigo-400/30 bg-indigo-500/20 hover:bg-indigo-500/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-red-50'}`}>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isMe ? 'white' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={`text-xs font-medium truncate ${isMe ? 'text-white' : 'text-slate-700'}`}>{msg.fileName || 'Document'}</p>
                                                                                <p className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                                    {msg.fileType?.includes('pdf') ? 'PDF' : 'Document'} — Tap to download
                                                                                </p>
                                                                            </div>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isMe ? 'white' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                                        </a>
                                                                    )}
                                                                    {msg.content && <p className="break-words leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content, isMe)}</p>}
                                                                </div>
                                                                    <div className="flex justify-end items-center mt-1.5 gap-1">
                                                                        {msg.isEdited && <span className={`text-[10px] italic ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>edited</span>}
                                                                        <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                            {msg.isEdited && msg.editedAt
                                                                                ? new Date(msg.editedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                                : msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                        </span>
                                                                        {isMe && (
                                                                            msg.isRead
                                                                                ? <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                                                                                : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                                        )}
                                                                    </div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />

                            {showTyping && (
                                <div className="flex items-end justify-start mt-3 animate-msg-slide-right">
                                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-[4px] px-4 py-3 flex items-center gap-1.5">
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-2 h-2 rounded-full bg-slate-400 inline-block"
                                                style={{ animation: `typing-bounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input area */}
                        <div className="bg-white/80 backdrop-blur-sm shrink-0 border-t border-slate-200/80">
                            {/* Suggestion chips — only on empty conversations */}
                            {messages.length === 0 && (
                                <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                                    {["How can I join this club?", "What activities are coming up?", "What are the membership requirements?"].map(text => (
                                        <button key={text} onClick={() => handleSendSuggestion(text)}
                                            className="px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 text-xs font-medium text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition-all active:scale-95">
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="p-3 sm:p-4">
                                {imagePreview && (
                                    <div className="mb-3 px-1">
                                        <div className="relative inline-flex items-end gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-200">
                                            <img src={imagePreview} className="h-20 w-20 object-cover rounded-xl shadow-sm" />
                                            <div className="flex flex-col gap-0.5 py-1 pr-6">
                                                <p className="text-xs font-medium text-slate-700 truncate max-w-[120px]">{selectedImage?.name || 'image'}</p>
                                                <p className="text-[10px] text-slate-400">{selectedImage ? (selectedImage.size / 1024).toFixed(0) + ' KB' : ''}</p>
                                            </div>
                                            <button onClick={clearSelectedImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors active:scale-90">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {selectedFile && (
                                    <div className="mb-3 px-1">
                                        <div className="relative inline-flex items-center gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                            </div>
                                            <div className="flex flex-col gap-0.5 pr-6">
                                                <p className="text-xs font-medium text-slate-700 truncate max-w-[150px]">{selectedFile.name}</p>
                                                <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                            <button onClick={clearSelectedFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors active:scale-90">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className={`p-2.5 rounded-2xl transition-all duration-200 shrink-0 active:scale-95 ${selectedImage ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        title="Attach image">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                    </button>
                                    <button type="button" onClick={() => docInputRef.current?.click()}
                                        className={`p-2.5 rounded-2xl transition-all duration-200 shrink-0 active:scale-95 ${selectedFile ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        title="Attach document">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    <input type="file" ref={docInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="hidden" />
                                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all overflow-hidden">
                                        <textarea rows={1} maxLength={200}
                                            className="w-full max-h-32 px-4 py-3 text-[15px] bg-transparent focus:outline-none resize-none hide-scrollbar text-slate-800 placeholder-slate-400"
                                            placeholder="Type a message…"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                                            }}
                                        />
                                        {newMessage.length > 0 && (
                                            <div className="flex items-center justify-end gap-1.5 px-4 pb-2">
                                                <div className="h-1 flex-1 max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-300 ${newMessage.length > 180 ? 'bg-red-400' : newMessage.length > 140 ? 'bg-amber-400' : 'bg-indigo-400'}`}
                                                         style={{ width: `${(newMessage.length / 200) * 100}%` }} />
                                                </div>
                                                <span className={`text-[10px] font-medium tabular-nums ${newMessage.length > 180 ? 'text-red-500' : newMessage.length > 140 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {newMessage.length}/200
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" disabled={!newMessage.trim() && !selectedImage && !selectedFile}
                                        className={`w-11 h-11 shrink-0 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center text-white transition-all shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-200/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-90 disabled:shadow-none ${isSending ? 'animate-send-press' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete conversation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-modal-backdrop" onClick={() => !isDeletingChat && setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="px-6 pt-6 pb-5">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Conversation</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">This will remove the conversation from your inbox. The club will still have their copy.</p>
                        </div>
                        <div className="px-6 pb-6 flex gap-2.5">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeletingChat}
                                className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConversation} disabled={isDeletingChat}
                                className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isDeletingChat ? (
                                    <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent"/><span>Deleting…</span></>
                                ) : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image lightbox */}
            {lightboxImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-modal-backdrop p-4"
                     onClick={() => setLightboxImage(null)}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                            onClick={() => setLightboxImage(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    <img src={lightboxImage} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-lightbox-zoom"
                         onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}

export default function StudentChatPage() {
    return (
        <AuthGuard>
            <ChatApp />
        </AuthGuard>
    );
}
