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
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);