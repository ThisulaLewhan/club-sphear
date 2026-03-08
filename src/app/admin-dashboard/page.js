import { getCurrentUser } from "@/lib/auth-utils";

export default async function AdminDashboardOverview() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome back, {user?.name || "Admin"}!</h2>
        <p className="text-gray-600 mb-6">
          This is the admin control panel. You are logged in as a <strong>{user?.role === "mainAdmin" ? "Main Admin" : "Admin"}</strong>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.role === "mainAdmin" && (
            <>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Account Management</h3>
                <p className="text-sm text-blue-600 mb-4">Create new administrator or club accounts for the platform.</p>
                <div className="flex gap-3">
                  <a href="/admin-dashboard/create-admin" className="text-sm bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition">Create Admin</a>
                  <a href="/admin-dashboard/create-club" className="text-sm bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded shadow-sm hover:bg-blue-50 transition">Create Club</a>
                </div>
              </div>
            </>
          )}
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Profile</h3>
            <p className="text-sm text-purple-600 mb-4">Manage your personal account settings and password.</p>
            <a href="/admin-profile" className="inline-block text-sm bg-purple-600 text-white px-4 py-2 rounded shadow-sm hover:bg-purple-700 transition">Edit Profile</a>
          </div>
        </div>
      </div>
    </div>
  );
}
