"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const ConfirmContext = createContext();

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
    return ctx;
}

export default function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setState({
                message,
                title: options.title || "Are you sure?",
                confirmText: options.confirmText || "Confirm",
                cancelText: options.cancelText || "Cancel",
                variant: options.variant || "danger", // "danger" | "warning" | "info"
            });
        });
    }, []);

    const handleConfirm = () => {
        resolveRef.current?.(true);
        setState(null);
    };

    const handleCancel = () => {
        resolveRef.current?.(false);
        setState(null);
    };

    // Close on Escape key
    useEffect(() => {
        if (!state) return;
        const handler = (e) => { if (e.key === "Escape") handleCancel(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    });

    const variantStyles = {
        danger: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
            ),
            button: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20",
        },
        warning: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            ),
            button: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20",
        },
        info: {
            icon: (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            ),
            button: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20",
        },
    };

    const v = state ? (variantStyles[state.variant] || variantStyles.danger) : null;

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            {/* Modal Overlay */}
            {state && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 fade-in duration-200">
                        {v.icon}
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">{state.title}</h3>
                        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{state.message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                            >
                                {state.cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${v.button}`}
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
