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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Club || mongoose.model("Club", ClubSchema);