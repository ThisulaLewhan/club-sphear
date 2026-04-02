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
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const messagesEndRef = useRef(null);
    const contextMenuRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const sendMessageContent = async (text, image = null, previewUrl = null) => {
        if ((!text.trim() && !image) || !activeConversation) return;

        const optimisticId = "temp-" + Date.now();
        const optimisticMessage = {
            _id: optimisticId,
            sender: user.id || user._id,
            content: text,
            imageUrl: previewUrl,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const formData = new FormData();
            formData.append("conversationId", activeConversation._id);
            formData.append("content", text);
            if (image) formData.append("image", image);

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
        if ((!newMessage.trim() && !selectedImage) || !activeConversation) return;

        const contentToSend = newMessage;
        const imageToSend = selectedImage;
        const previewToSend = imagePreview;
        setNewMessage("");
        clearSelectedImage();

        await sendMessageContent(contentToSend, imageToSend, previewToSend);
    };

    const handleSendSuggestion = async (text) => {
        await sendMessageContent(text);
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
        <div className="h-[100dvh] w-full flex bg-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={`w-full sm:w-80 bg-white border-r border-slate-200 flex flex-col ${activeConversation ? 'hidden sm:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3 shrink-0">
                    <Link href="/student-profile" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0" title="Back to Dashboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <h2 className="font-bold text-white text-lg">Messages</h2>
                </div>

                {/* Search */}
                <div className="p-3 bg-white border-b border-slate-100 shrink-0">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search clubs to chat..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {isSearching ? (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Clubs</div>
                            {searchResults.length > 0 ? (
                                searchResults.map(club => (
                                    <div key={club._id} onClick={() => handleStartNewChat(club)} className="px-4 py-3 hover:bg-indigo-50/50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 group">
                                        <div className={`w-11 h-11 rounded-full ${getAvatarColor(club.name)} overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                                            {club.logo ? <img src={club.logo} alt={club.name} className="w-full h-full object-cover" /> : club.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-800 truncate">{club.name}</h3>
                                            <p className="text-xs text-indigo-500 font-medium flex items-center gap-1 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                Start new chat
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">No clubs found for &quot;{searchQuery}&quot;</div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {conversations.length > 0 ? (
                                conversations.map(conv => {
                                    const partner = getPartner(conv);
                                    const isActive = activeConversation?._id === conv._id;
                                    const hasUnread = conv.unreadCount > 0 && !isActive;
                                    const lastMsg = conv.lastMessage;
                                    const preview = lastMsg
                                        ? lastMsg.isDeleted
                                            ? 'This message was deleted'
                                            : lastMsg.imageUrl && !lastMsg.content
                                                ? '📷 Photo'
                                                : lastMsg.content
                                        : 'Start chatting!';
                                    return (
                                        <div key={conv._id} onClick={() => handleSelectConversation(conv)} className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-all ${isActive ? 'bg-indigo-50 border-r-[3px] border-indigo-500' : 'hover:bg-slate-50 border-b border-slate-100'}`}>
                                            <div className={`w-11 h-11 rounded-full ${getAvatarColor(partner?.name)} overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                                                {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className={`truncate text-sm ${hasUnread ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}>{partner?.name || "Unknown"}</h3>
                                                    {conv.updatedAt && <span className={`text-[11px] whitespace-nowrap ml-2 shrink-0 ${hasUnread ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                </div>
                                                <div className="flex justify-between items-center gap-1">
                                                    <p className={`text-xs truncate ${lastMsg?.isDeleted ? 'italic text-slate-400' : hasUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{preview}</p>
                                                    {hasUnread && (
                                                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                                                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-600 mb-1">No conversations yet</p>
                                        <p className="text-xs text-slate-400">Search for a club above to start messaging.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-slate-50 relative ${!activeConversation ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>

                {!activeConversation ? (
                    <div className="text-center z-10 p-8 flex flex-col items-center justify-center h-full">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Club Connect</h2>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">Select a conversation or search for a club to start chatting with their team.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button className="sm:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setActiveConversation(null)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                {(() => {
                                    const partner = getPartner(activeConversation);
                                    return (
                                        <>
                                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(partner?.name)} overflow-hidden flex items-center justify-center text-white font-bold shadow-sm`}>
                                                {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover" /> : partner?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-slate-800 leading-tight text-sm">{partner?.name || "Unknown"}</h2>
                                                <p className="text-[11px] text-indigo-500 font-medium flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                                                    Verified Club
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                                title="Delete Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 z-10 flex flex-col" onClick={closeContextMenu}>

                            {/* Empty state — avatar + name only */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                                    {(() => { const partner = getPartner(activeConversation); return (
                                        <div className={`w-16 h-16 rounded-full ${getAvatarColor(partner?.name)} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                                            {partner?.logo ? <img src={partner.logo} alt={partner?.name} className="w-full h-full object-cover rounded-full" /> : partner?.name?.charAt(0) || "?"}
                                        </div>
                                    ); })()}
                                    <div className="text-center">
                                        <p className="font-semibold text-slate-700">{getPartner(activeConversation)?.name || "Club"}</p>
                                        <p className="text-xs text-slate-400 mt-1">Send a message to start the conversation</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isMe = msg.sender === (user.id || user._id);
                                const isEditing = editingMsg?._id === msg._id;
                                const prevMsg = messages[index - 1];
                                const nextMsg = messages[index + 1];
                                // Group detection — consecutive = same sender, no date break, not deleted
                                const isConsecutive = prevMsg && prevMsg.sender === msg.sender && !prevMsg.isDeleted && !msg.isDeleted;
                                const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || msg.isDeleted || nextMsg.isDeleted;
                                const showDateSeparator = !prevMsg || formatMessageDate(msg.createdAt) !== formatMessageDate(prevMsg.createdAt);

                                // Bubble shape: tail only on the FIRST message of a group
                                const bubbleShape = msg.isDeleted
                                    ? 'rounded-2xl'
                                    : isConsecutive
                                        ? 'rounded-2xl'
                                        : isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm';

                                const bubbleColor = msg.isDeleted
                                    ? 'bg-slate-100 border border-slate-200/80 text-slate-400'
                                    : isMe
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                        : 'bg-white text-slate-800 border border-slate-100 shadow-sm';

                                return (
                                    <div key={msg._id || index}>
                                        {showDateSeparator && msg.createdAt && (
                                            <div className="flex items-center gap-3 my-5">
                                                <div className="flex-1 h-px bg-slate-200"/>
                                                <span className="text-[11px] text-slate-400 font-medium px-3 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap shadow-sm">
                                                    {formatMessageDate(msg.createdAt)}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-200"/>
                                            </div>
                                        )}
                                        <div className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} group ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
                                            {/* ⋮ Menu — only visible on hover, left of my messages */}
                                            {isMe && !msg.isDeleted && !isEditing && (
                                                <div className="relative shrink-0 mb-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu?.msgId === msg._id ? null : { msgId: msg._id, x: 0, y: 0, msg, inline: true }); }}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        style={{ opacity: contextMenu?.msgId === msg._id ? 1 : undefined }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                                    </button>
                                                    {contextMenu?.msgId === msg._id && contextMenu?.inline && (
                                                        <div className="absolute bottom-full right-0 mb-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden w-36" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => handleStartEdit(contextMenu.msg)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                                Edit
                                                            </button>
                                                            <div className="border-t border-slate-100"/>
                                                            <button onClick={() => handleDeleteMsg(contextMenu.msgId)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                                className={`max-w-[65%] sm:max-w-[55%] px-3.5 py-2 relative text-[14.5px] select-none transition-all ${bubbleShape} ${bubbleColor}`}
                                            >
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                                        <textarea
                                                            autoFocus
                                                            maxLength={200}
                                                            rows={2}
                                                            className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 text-sm text-slate-800 focus:outline-none resize-none"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                                                                if (e.key === 'Escape') { setEditingMsg(null); setEditContent(""); }
                                                            }}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditingMsg(null); setEditContent(""); }} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                                            <button onClick={handleSaveEdit} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {msg.isDeleted ? (
                                                            <p className="flex items-center gap-1.5 text-[13px] italic py-0.5">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                                This message was deleted
                                                                {msg.createdAt && <span className="ml-auto pl-2 text-[10px] not-italic opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {msg.imageUrl && (
                                                                        <div className="rounded-xl overflow-hidden -mx-0.5 max-w-full">
                                                                            <img
                                                                                src={msg.imageUrl}
                                                                                alt="Sent in chat"
                                                                                className="max-w-full max-h-[260px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                                                onClick={(e) => { e.stopPropagation(); window.open(msg.imageUrl, '_blank'); }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {msg.content && <p className="break-words leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content, isMe)}</p>}
                                                                </div>
                                                                {/* Timestamp + tick — only on last message in group */}
                                                                {(isLastInGroup || msg.isEdited) && (
                                                                    <div className="flex justify-end items-center mt-1 gap-1">
                                                                        {msg.isEdited && (
                                                                            <span className={`text-[10px] italic ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>edited</span>
                                                                        )}
                                                                        <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                        </span>
                                                                        {isMe && (
                                                                            <span className="flex items-center">
                                                                                {msg.isRead ? (
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                                                                                ) : (
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
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
                        </div>

                        {/* Context Menu */}
                        {contextMenu && (
                            <div
                                ref={contextMenuRef}
                                className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden w-40 animate-in fade-in"
                                style={{ top: contextMenu.y, left: contextMenu.x }}
                            >
                                <button
                                    onClick={() => handleStartEdit(contextMenu.msg)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Edit
                                </button>
                                <div className="border-t border-slate-100"/>
                                <button
                                    onClick={() => handleDeleteMsg(contextMenu.msgId)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    Delete
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="bg-white z-10 shrink-0 border-t border-slate-200">
                            {messages.length === 0 && (
                                <div className="flex flex-wrap gap-2 px-3 pt-3">
                                    {[
                                        "How can I join this club?",
                                        "What activities are coming up?",
                                        "What are the membership requirements?",
                                    ].map((text) => (
                                        <button
                                            key={text}
                                            onClick={() => handleSendSuggestion(text)}
                                            className="px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-xs text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition-colors"
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        <div className="p-3">
                            {imagePreview && (
                                <div className="max-w-4xl mx-auto mb-2 px-2">
                                    <div className="relative inline-block">
                                        <img src={imagePreview} className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-md" />
                                        <button 
                                            onClick={clearSelectedImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-2.5 rounded-full transition-all duration-200 ${selectedImage ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-end">
                                    <textarea 
                                        rows={1}
                                        maxLength={200}
                                        className="w-full max-h-32 px-4 py-3 text-[15px] bg-transparent focus:outline-none resize-none hide-scrollbar"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    {newMessage.length > 150 && (
                                        <div className="text-[10px] text-slate-400 font-medium px-4 pb-2 text-right">
                                            {newMessage.length}/200
                                        </div>
                                    )}
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() && !selectedImage}
                                    className="w-12 h-12 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 flex items-center justify-center text-white transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 -mt-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </div>
                        </div>
                    </>
                )}
            </div>
        {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Conversation</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        This will remove the conversation for you. Are you sure?
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeletingChat}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteConversation}
                            disabled={isDeletingChat}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        >
                            {isDeletingChat ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
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
