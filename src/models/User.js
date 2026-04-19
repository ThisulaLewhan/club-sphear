import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["student", "club", "admin", "mainAdmin"], 
    default: "student" 
  },
  // fields for user profile
  university: { type: String, default: "" },
  studentId: { type: String, default: "" },
  bio: { type: String, default: "" },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);