import RoleGuard from "@/components/admin/RoleGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function AdminProfileLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <RoleGuard allowedRoles={["mainAdmin", "admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar userRole={user?.role} />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
