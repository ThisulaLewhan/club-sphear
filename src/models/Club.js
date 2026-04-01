import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: [
      "Technology & Innovation",
      "Academic & Professional",
      "Arts & Humanities",
      "Business & Leadership",
      "Community & Social",
      "Media & Communications",
      "Recreation & Esports",
    ],
    required: true,
  },
  description: String,
  logo: String,
  coverImage: String,
  executiveBoard: [{
    name: { type: String, required: true },
    role: { type: String, required: true }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

delete mongoose.models.Club;
export default mongoose.models.Club || mongoose.model("Club", ClubSchema);