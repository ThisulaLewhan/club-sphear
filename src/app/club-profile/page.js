import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth-utils";
import ClubProfileForm from "@/components/admin/ClubProfileForm";

export default async function ClubProfilePage() {
  const currentUser = await getCurrentUser();
  await connectDB();
  
  let dbUser = null;
  let dbClub = null;
  
  try {
    if (currentUser?.id) {
      dbUser = await User.findById(currentUser.id).lean();
    }
    if (currentUser?.clubId) {
      dbClub = await Club.findById(currentUser.clubId).lean();
    }
  } catch (err) {
    console.error("Db Fetch Error:", err);
  }

  const initialData = {
    name: dbClub?.name || dbUser?.name || currentUser?.name || "",
    email: dbUser?.email || currentUser?.email || "",
    description: dbClub?.description || "",
    logo: dbClub?.logo || ""
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Club Profile</h1>
      <ClubProfileForm initialData={initialData} />
    </div>
  );
}
