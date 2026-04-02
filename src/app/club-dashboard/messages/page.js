"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function ClubMessagesPage() {
    const { user } = useAuth();
    const toast = useToast();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    
    const [filterQuery, setFilterQuery] = useState("");
    const [contextMenu, setContextMenu] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
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
                if (activeConversation) {
                    const updatedActive = data.conversations.find(c => c._id === activeConversation._id);
                    // Only update if there's a real data change to prevent cycles
                    if (updatedActive && JSON.stringify(updatedActive) !== JSON.stringify(activeConversation)) {
                        setActiveConversation(updatedActive);
                    }
                }
            }
        } catch (error) {
            console.error("FetchConversations Error (Club):", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [user]);

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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !activeConversation) return;

        const optimisticId = "temp-" + Date.now();
        const optimisticMessage = {
            _id: optimisticId,
            sender: user.id || user._id, 
            content: newMessage,
            imageUrl: imagePreview, // Use preview as temporary URL
            createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        const contentToSend = newMessage;
        const imageToSend = selectedImage;
        setNewMessage("");
        clearSelectedImage();

        try {
            const formData = new FormData();
            formData.append("conversationId", activeConversation._id);
            formData.append("content", contentToSend);
            if (imageToSend) {
                formData.append("image", imageToSend);
            }

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

    const renderMessageContent = (content) => {
        if (!content) return null;
        
        // WhatsApp-like URL detection regex
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
                        className="text-indigo-600 hover:underline break-all"
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

    const filteredConversations = filterQuery
        ? conversations.filter(c => {
            const p = getPartner(c);
            return p && (p.name || "").toLowerCase().includes(filterQuery.toLowerCase());
        })
        : conversations;

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] sm:h-[800px] max-h-[90vh] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex font-sans">
            {/* Sidebar */}
            <div className={`w-full sm:w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col ${activeConversation ? 'hidden sm:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-16 px-4 bg-slate-50 border-b border-slate-200 flex items-center shrink-0">
                    <h2 className="font-bold text-slate-800 text-lg">Inbox</h2>
                </div>

                {/* Search / Filter */}
                <div className="p-3 bg-white border-b border-slate-100 shrink-0">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Filter active chats..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-colors"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                            const partner = getPartner(conv);
                            const isActive = activeConversation?._id === conv._id;
                            return (
                                <div key={conv._id} onClick={() => handleSelectConversation(conv)} className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${isActive ? 'bg-indigo-50 border-r-4 border-indigo-500' : 'hover:bg-slate-50 border-b border-slate-100'}`}>
                                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold text-lg">
                                        {partner?.name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`font-semibold truncate ${conv.unreadCount > 0 && !isActive ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>{partner?.name || "Student"}</h3>
                                            {conv.updatedAt && <span className={`text-xs whitespace-nowrap ml-2 ${conv.unreadCount > 0 && !isActive ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 && !isActive ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{conv.lastMessage ? conv.lastMessage.content : "Waiting for message..."}</p>
                                            {(conv.unreadCount > 0 && !isActive) && (
                                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <p className="font-medium text-slate-500 mb-1">No chats</p>
                            <p className="text-sm">When students message you, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] relative ${!activeConversation ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.15\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

                {!activeConversation ? (
                    <div className="text-center z-10 p-8">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <h2 className="text-2xl font-light text-slate-700 mb-2">Club Messenger</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">Select a chat from the sidebar to reply to student inquiries.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button className="sm:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => setActiveConversation(null)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                {(() => {
                                    const partner = getPartner(activeConversation);
                                    return (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold shadow-sm border border-slate-100">
                                                {partner?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-slate-800 leading-tight">{partner?.name || "Student"}</h2>
                                                <p className="text-xs text-slate-500 font-medium">Student</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                                title="Delete Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 flex flex-col space-y-3" onClick={closeContextMenu}>
                            <div className="text-center my-4">
                                <span className="px-3 py-1 bg-white/70 backdrop-blur rounded-lg shadow-sm text-xs text-slate-500 uppercase tracking-wide">Beginning of encrypted chat</span>
                            </div>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === (user.id || user._id);
                                const isEditing = editingMsg?._id === msg._id;
                                return (
                                    <div key={msg._id || index} className={`flex items-end gap-1 ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        {/* ⋮ Menu button — left side for my messages */}
                                        {isMe && !msg.isDeleted && !isEditing && (
                                            <div className="relative shrink-0 mb-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu?.msgId === msg._id ? null : { msgId: msg._id, x: 0, y: 0, msg, inline: true }); }}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-black/10 transition-all opacity-0 group-hover:opacity-100 sm:opacity-0 sm:focus:opacity-100 touch-action-manipulation"
                                                    style={{ opacity: contextMenu?.msgId === msg._id ? 1 : undefined }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
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
                                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative text-[15px] select-none
                                                ${msg.isDeleted ? 'bg-slate-100 border border-slate-200 text-slate-400 italic' :
                                                isMe ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}
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
                                                        <button onClick={handleSaveEdit} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.isDeleted ? (
                                                        <p className="flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                            This message was deleted
                                                        </p>
                                                    ) : (
                                                        <div className="flex flex-col gap-2 text-wrap">
                                                            {msg.imageUrl && (
                                                                <div className="rounded-lg overflow-hidden border border-black/5 bg-black/5 max-w-full">
                                                                    <img 
                                                                        src={msg.imageUrl} 
                                                                        alt="Sent in chat" 
                                                                        className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(msg.imageUrl, '_blank');
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {msg.content && <p className="break-words leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end items-center mt-1 gap-1">
                                                        {msg.isEdited && !msg.isDeleted && (
                                                            <span className="text-[10px] text-slate-400 italic">Edited</span>
                                                        )}
                                                        <span className={`text-[10px] ${isMe ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                        {isMe && !msg.isDeleted && (
                                                            <span className="ml-1 flex items-center">
                                                                {msg.isRead ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
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
                                className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden w-40"
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
                        <div className="p-3 bg-[#f0f2f5] z-10 shrink-0 border-t border-slate-200">
                            {imagePreview && (
                                <div className="max-w-4xl mx-auto mb-2 px-2 text-start">
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
                                    className="w-12 h-12 shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 flex items-center justify-center text-white transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 -mt-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
