"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext();

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

let toastId = 0;

function ToastItem({ toast, onDismiss }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    const styles = {
        success: {
            bg: "bg-emerald-50 border-emerald-200",
            text: "text-emerald-800",
            icon: (
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        error: {
            bg: "bg-red-50 border-red-200",
            text: "text-red-800",
            icon: (
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        info: {
            bg: "bg-blue-50 border-blue-200",
            text: "text-blue-800",
            icon: (
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        warning: {
            bg: "bg-amber-50 border-amber-200",
            text: "text-amber-800",
            icon: (
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ),
        },
    };

    const s = styles[toast.type] || styles.info;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm max-w-sm w-full transition-all duration-300 ${s.bg} ${exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}
            role="alert"
        >
            {s.icon}
            <p className={`text-sm font-medium flex-1 ${s.text}`}>{toast.message}</p>
            <button onClick={handleDismiss} className="text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const toast = {
        success: (msg, dur) => addToast("success", msg, dur),
        error: (msg, dur) => addToast("error", msg, dur),
        info: (msg, dur) => addToast("info", msg, dur),
        warning: (msg, dur) => addToast("warning", msg, dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3" aria-live="polite">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
