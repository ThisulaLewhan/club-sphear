"use client";

import { useEffect, useState, useMemo, useRef } from "react";

export default function EventCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // In a real scenario we'd query by month/year, but here we load all approved events for simplicity
                const response = await fetch("/api/events?status=approved");
                const json = await response.json();
                if (json.success) {
                    setEvents(json.data);
                } else {
                    setError("Failed to load events.");
                }
            } catch (err) {
                setError("Error fetching events.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Generate colors dynamically based on event title for consistency
    const getEventColor = (title) => {
        const colors = [
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800',
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-800',
            'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800',
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
            'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800',
        ];
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Calendar logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayIndex = getFirstDayOfMonth(year, month);

        let grid = [];

        // Previous month padding
        const prevMonthDays = getDaysInMonth(year, month - 1);
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            grid.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - i)
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            grid.push({
                day,
                isCurrentMonth: true,
                date: new Date(year, month, day)
            });
        }

        // Next month padding to fill remaining row (always complete a week, up to 6 rows)
        const remainingSlots = (7 - (grid.length % 7)) % 7;
        for (let i = 1; i <= remainingSlots; i++) {
            grid.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        // If very short month started on Sunday, we might only have 4 rows. Add another row of next month padding to keep grid height stable
        while (grid.length < 35) {
            let lastDate = grid[grid.length - 1].date;
            let nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + 1);
            grid.push({
                day: nextDate.getDate(),
                isCurrentMonth: false,
                date: nextDate
            });
        }

        return grid;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getEventsForDay = (date) => {
        return events.filter(evt => {
            const evtDate = new Date(evt.date);
            return evtDate.getFullYear() === date.getFullYear() &&
                evtDate.getMonth() === date.getMonth() &&
                evtDate.getDate() === date.getDate();
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const handleMonthSelect = (index) => {
        setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
        setShowMonthDropdown(false);
    };

    const handleYearSelect = (year) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setShowYearDropdown(false);
    };

    // Close dropdowns when clicking outside
    const monthDropdownRef = useRef(null);
    const yearDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
                setShowYearDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Generate years for the dropdown (e.g., from 5 years ago to 5 years in the future)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="flex flex-col flex-1 min-h-[800px] w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-50">
            {/* Header Area */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 flex-wrap gap-4 relative z-50">
                <div className="flex items-center gap-2">
                    {/* Month Dropdown */}
                    <div className="relative" ref={monthDropdownRef}>
                        <button
                            type="button"
                            onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xl sm:text-2xl font-bold tracking-tight rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {monthNames[currentDate.getMonth()]}
                            <svg className={`w-5 h-5 text-zinc-400 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {showMonthDropdown && (
                            <div className="absolute top-full left-0 mt-1 max-h-64 overflow-y-auto w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-[60]">
                                {monthNames.map((month, index) => (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => handleMonthSelect(index)}
                                        className={`w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium ${currentDate.getMonth() === index ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative" ref={yearDropdownRef}>
                        <button
                            type="button"
                            onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xl sm:text-2xl font-bold tracking-tight rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {currentDate.getFullYear()}
                            <svg className={`w-5 h-5 text-zinc-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {showYearDropdown && (
                            <div className="absolute top-full left-0 mt-1 max-h-64 overflow-y-auto w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-[60]">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={`w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium ${currentDate.getFullYear() === year ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleToday} className="px-4 py-1.5 text-sm font-semibold rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        Today
                    </button>
                    <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-md p-1">
                        <button onClick={handlePrevMonth} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors" aria-label="Previous month">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors" aria-label="Next month">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid Area */}
            <div className="flex-grow flex flex-col p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2 flex-shrink-0">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="flex-grow grid grid-cols-7 border-l border-t border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <div className="text-red-500 bg-red-50 dark:bg-red-900/30 px-6 py-3 rounded-lg shadow-lg pointer-events-auto">{error}</div>
                        </div>
                    )}

                    {calendarGrid.map((dayObj, idx) => {
                        const dayEvents = getEventsForDay(dayObj.date);
                        const today = isToday(dayObj.date);

                        return (
                            <div
                                key={idx}
                                className={`
                                    min-h-[120px] p-1.5 border-r border-b border-zinc-200 dark:border-zinc-800 
                                    flex flex-col transition-colors relative group
                                    ${dayObj.isCurrentMonth ? 'bg-white dark:bg-black' : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-600'}
                                    hover:bg-zinc-50 dark:hover:bg-zinc-900/50
                                `}
                            >
                                <div className="flex items-center justify-center w-full mb-1">
                                    <span className={`
                                        text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full
                                        ${today ? 'bg-blue-600 text-white' : ''}
                                        ${!today && dayObj.isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300' : ''}
                                    `}>
                                        {dayObj.day}
                                    </span>
                                </div>

                                <div className="flex-grow flex flex-col gap-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-1">
                                    {dayEvents.map(evt => (
                                        <div
                                            key={evt._id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                                            className={`
                                                cursor-pointer px-1.5 py-1 text-xs rounded border truncate font-medium
                                                transition-transform hover:scale-[1.02] active:scale-95 shadow-sm
                                                ${getEventColor(evt.title)}
                                            `}
                                        >
                                            <span className="opacity-80 mr-1">{evt.startTime}</span>
                                            {evt.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md text-white dark:text-zinc-200 p-2 rounded-full transition-colors" onClick={() => setSelectedEvent(null)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="overflow-y-auto no-scrollbar flex-1 relative -mx-6 px-6 -mb-6 pb-12">
                            {selectedEvent.imageUrl && (
                                <div className="-mx-6 -mt-6 mb-5 aspect-square relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-4 pr-8 text-black dark:text-white ${!selectedEvent.imageUrl ? "mt-2" : ""}`}>{selectedEvent.title}</h3>
                            <div className="space-y-3 mb-6">
                                <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                    <strong className="w-16">Date:</strong> {formatDate(selectedEvent.date)}
                                </p>
                                <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                    <strong className="w-16">Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}
                                </p>
                                <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                    <strong className="w-16">Venue:</strong> {selectedEvent.venue}
                                </p>
                            </div>
                            {selectedEvent.description && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-black dark:text-white">Description</h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">{selectedEvent.description}</p>
                                </div>
                            )}
                            {selectedEvent.registrationLink && (
                                <a
                                    href={selectedEvent.registrationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-2"
                                >
                                    Register for Event
                                </a>
                            )}
                        </div>

                        {/* Scroll hint gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
