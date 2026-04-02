import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Club from "@/models/Club";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || "";

    const clubs = await Club.find({ name: { $regex: q, $options: "i" } }).select("name logo _id");

    const clubIds = clubs.map(c => c._id);
    const users = await User.find({ role: "club", clubId: { $in: clubIds } });

    const results = users.map(u => {
        const clubData = clubs.find(c => c._id.toString() === u.clubId.toString());
        return {
            _id: u._id, 
            name: clubData.name,
            logo: clubData.logo
        };
    });

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
