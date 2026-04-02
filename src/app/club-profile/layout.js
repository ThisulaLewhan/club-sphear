import RoleGuard from "@/components/admin/RoleGuard";
import { getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";

export default async function ClubProfileLayout({ children }) {
  await getCurrentUser();
  return (
    <RoleGuard allowedRoles={["club"]}>
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-md flex flex-col h-full border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Club Panel</h2>
          </div>
          <nav className="flex-1 px-4 py-4">
             <Link href="/club-profile" className="block px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white transition-colors">
               My Profile
             </Link>
          </nav>
        </div>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
