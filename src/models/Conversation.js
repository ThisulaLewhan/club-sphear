import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

delete mongoose.models.Conversation;
export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
