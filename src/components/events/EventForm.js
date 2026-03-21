"use client";

import { useState, useRef, useEffect } from "react";

// --- Custom Time Picker ---
function CustomTimePicker({ name, value, onChange, label, required }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const times = [];
    for (let i = 7; i <= 22; i++) {
        const h = i.toString().padStart(2, "0");
        times.push(`${h}:00`, `${h}:15`, `${h}:30`, `${h}:45`);
    }

    return (
        <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label} {required && "*"}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left border rounded-lg bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between"
            >
                <span className={value ? "text-black dark:text-white" : "text-zinc-400"}>
                    {value || "Select Time"}
                </span>
                <svg className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 py-2">
                    {times.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => {
                                onChange({ target: { name, value: t } });
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium ${value === t ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-zinc-700 dark:text-zinc-300"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Custom Venue Picker ---
function CustomVenuePicker({ name, value, onChange, label, required }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const venues = [
        "Main hall",
        "Open Air Theatre",
        "Ground",
        "G1401",
        "G1402",
        "F1401",
        "F1402"
    ];

    return (
        <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label} {required && "*"}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-left border rounded-xl bg-zinc-50/50 dark:bg-black border-zinc-200 dark:border-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all flex items-center justify-between"
            >
                <span className={value ? "text-black dark:text-white" : "text-zinc-400"}>
                    {value || "Select Venue"}
                </span>
                <svg className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 py-2">
                    {venues.map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => {
                                onChange({ target: { name, value: v } });
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium ${value === v ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-zinc-700 dark:text-zinc-300"}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Custom Date Picker ---
function CustomDatePicker({ name, value, onChange, label, required }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateSelect = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format YYYY-MM-DD local time directly
        const formatted = `${selected.getFullYear()}-${(selected.getMonth() + 1).toString().padStart(2, "0")}-${selected.getDate().toString().padStart(2, "0")}`;
        onChange({ target: { name, value: formatted } });
        setIsOpen(false);
    };

    const displayDate = value ? new Date(value + "T00:00:00").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "";

    return (
        <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label} {required && "*"}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left border rounded-lg bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between"
            >
                <span className={value ? "text-black dark:text-white font-medium" : "text-zinc-400"}>
                    {displayDate || "Select Date"}
                </span>
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-black dark:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="font-bold text-lg text-black dark:text-white">
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </div>
                        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-black dark:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-center text-xs font-semibold text-zinc-400">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNumber = i + 1;
                            const isSelected = value && new Date(value + "T00:00:00").getDate() === dayNumber && new Date(value + "T00:00:00").getMonth() === viewDate.getMonth();
                            const isToday = new Date().getDate() === dayNumber && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();

                            return (
                                <button
                                    key={dayNumber}
                                    type="button"
                                    onClick={() => handleDateSelect(dayNumber)}
                                    className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors
                                        ${isSelected ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" :
                                            isToday ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700" :
                                                "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                >
                                    {dayNumber}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EventForm() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        registrationLink: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);

    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === "image" && e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (!formData.date || !formData.startTime || !formData.endTime) {
            setMessage({ type: "error", text: "Please carefully select a Date, Start Time, and End Time." });
            setLoading(false);
            return;
        }

        // frontend constraint for event lengths
        if (formData.title.length < 3 || formData.title.length > 100) {
            setMessage({ type: "error", text: "Title must be between 3 and 100 characters." });
            setLoading(false);
            return;
        }
        if (formData.description.length > 2000) {
            setMessage({ type: "error", text: "Description must be under 2000 characters." });
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== "") {
                    submitData.append(key, value);
                }
            });

            const response = await fetch("/api/events", {
                method: "POST",
                body: submitData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Event submitted successfully and is pending approval!" });
                setFormData({ title: "", description: "", date: "", startTime: "", endTime: "", venue: "", registrationLink: "", image: null });
                setImagePreview(null);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to submit event." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Network error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 sm:p-10 bg-white dark:bg-zinc-950 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800/80">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Craft an Event</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Fill in the details below. We'll verify venue and time slots for conflicts instantly.</p>
            </div>

            {message.text && (
                <div className={`p-4 mb-8 rounded-xl font-medium flex items-center gap-3 ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20"}`}>
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={message.type === "success" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}></path></svg>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 text-left">
                {/* Core Event Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">1. Core Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload Area */}
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Cover Image (Optional)</label>
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-xl cursor-pointer bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 overflow-hidden relative transition-colors group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                    </div>
                                )}
                                {imagePreview && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-black/70 text-white px-4 py-2 rounded-lg font-medium text-sm">Replace Image</span>
                                    </div>
                                )}
                                <input type="file" name="image" accept="image/*" className="hidden" onChange={handleChange} />
                            </label>
                        </div>

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Title *</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Annual Tech Symposium" className="w-full px-4 py-3 bg-zinc-50/50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                            <textarea rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="What will this event be about?" className="w-full px-4 py-3 bg-zinc-50/50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none" />
                        </div>
                    </div>
                </div>

                {/* Timing & Logistics */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">2. Timing & Logistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CustomDatePicker name="date" value={formData.date} onChange={handleChange} label="Date" required />
                        <CustomTimePicker name="startTime" value={formData.startTime} onChange={handleChange} label="Start Time" required />
                        <CustomTimePicker name="endTime" value={formData.endTime} onChange={handleChange} label="End Time" required />
                    </div>
                </div>

                {/* Location & Extra */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">3. Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomVenuePicker name="venue" value={formData.venue} onChange={handleChange} label="Venue" required />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration Link (Optional)</label>
                            <input type="url" name="registrationLink" value={formData.registrationLink} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 bg-zinc-50/50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all" />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button disabled={loading} type="submit" className="group w-full md:w-auto md:ml-auto md:px-12 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-600/20">
                        {loading ? "Processing..." : "Submit Event for Approval"}
                        {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                    </button>
                </div>
            </form>
        </div>
    );
}
