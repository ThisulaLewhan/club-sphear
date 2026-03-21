"use client";

// Feature Domain: The Global Admin System


import AuthGuard from "@/components/auth/AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminDashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AdminDashboardContent>{children}</AdminDashboardContent>
    </AuthGuard>
  );
}

function AdminDashboardContent({ children }) {
  const { user } = useAuth();

  if (user && user.role !== "admin" && user.role !== "mainAdmin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar userRole={user?.role} />
      <main className="flex-1 min-h-screen overflow-y-auto p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
