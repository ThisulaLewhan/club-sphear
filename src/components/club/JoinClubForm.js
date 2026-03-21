"use client";

// Feature Domain: Student Experience & Public Content


import { useState } from "react";

export default function JoinClubForm({ club, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        studentName: "",
        studentId: "",
        email: "",
        phone: "",
        department: "Computer Science",
        yearOfStudy: "1st Year",
        reason: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    clubId: club.id,
                    clubName: club.name
                }),
            });

            if (!res.ok) {
                let errMsg = "Failed to submit application";
                try {
                    const errData = await res.json();
                    if (errData.error) errMsg = errData.error;
                } catch { /* ignore parse error */ }
                throw new Error(errMsg);
            }

            // Form submitted successfully
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="mb-2 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 mb-2">
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                    You are applying to join <strong className="font-bold">{club.name}</strong>. Please provide your student details to proceed.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="studentName" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="studentId" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Student ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        placeholder="e.g. IT21000000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        University Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        placeholder="john@my.sliit.lk"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        placeholder="07X XXX XXXX"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="department" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none"
                    >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Business">Business Administration</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="yearOfStudy" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Year of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="yearOfStudy"
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none"
                    >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="reason" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Why do you want to join? (Optional)
                </label>
                <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm resize-none"
                    placeholder="Briefly tell us your interests..."
                ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center min-w-[120px]"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Submitting...
                        </>
                    ) : (
                        "Submit Application"
                    )}
                </button>
            </div>
        </form>
    );
}
