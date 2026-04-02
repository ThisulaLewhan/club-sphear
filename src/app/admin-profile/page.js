import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth-utils";
import AdminProfileForm from "@/components/admin/AdminProfileForm";

export default async function AdminProfilePage() {
  const currentUser = await getCurrentUser();
  await connectDB();
  
  let dbUser = null;
  try {
    if (currentUser?.id) {
      dbUser = await User.findById(currentUser.id).lean();
    }
  } catch (err) {
    console.error("Db Fetch Error:", err);
  }

  const initialData = {
    name: dbUser?.name || currentUser?.name || "",
    email: dbUser?.email || currentUser?.email || ""
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      <AdminProfileForm initialData={initialData} />
    </div>
  );
}
