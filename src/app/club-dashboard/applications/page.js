"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ClubApplicationsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        if (!user?.clubId) return;
        try {
            const res = await fetch(`/api/applications?clubId=${user.clubId}`);
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            toast.error("Failed to fetch applications.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch("/api/applications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                toast.success(`Application ${status}!`);
                fetchApplications(); // Refresh list
            } else {
                toast.error("Update failed.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        }
    };

    const downloadPDF = () => {
        try {
            console.log("Starting PDF generation...");
            const doc = new jsPDF();
            
            // Add Title
            doc.setFontSize(20);
            doc.text(`${user?.name || "Club"} - Member Applications`, 14, 22);
            
            // Add Date
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            
            // Table Columns
            const tableColumn = ["Student Name", "Student ID", "Email", "Department", "Year", "Status"];
            
            // Table Rows
            const tableRows = applications.map(app => [
                app.studentName,
                app.studentId,
                app.email,
                app.department,
                app.yearOfStudy,
                app.status.toUpperCase()
            ]);

            // Generate Table
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            });

            // Save PDF
            doc.save(`${user?.name || "Club"}_Applications.pdf`);
            toast.success("PDF Downloaded!");
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Failed to generate PDF. See console for details.");
            alert("Error generating PDF: " + error.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Member Applications</h1>
                    <p className="text-slate-500 mt-1">Review and manage students who applied to join your club.</p>
                </div>
                <button
                    onClick={downloadPDF}
                    disabled={applications.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:bg-slate-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download Members List (PDF)
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p>Loading applications...</p>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Academics</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Join Reason</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Applied On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900">{app.studentName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{app.studentId} &middot; {app.email}</div>
                                            <div className="text-xs text-slate-400">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-slate-700 font-medium">{app.department}</div>
                                            <div className="text-xs text-slate-500">{app.yearOfStudy}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-slate-600 max-w-xs truncate" title={app.reason}>
                                                {app.reason || "No reason provided."}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                    app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {app.status}
                                                </span>
                                                {app.status === 'pending' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button 
                                                            onClick={() => updateStatus(app._id, 'approved')}
                                                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(app._id, 'rejected')}
                                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-xs text-slate-400">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Applications Yet</h3>
                        <p className="text-slate-500 mt-1">When students apply to join your club, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
