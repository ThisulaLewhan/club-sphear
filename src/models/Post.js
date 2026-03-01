import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: String,
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" }
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);