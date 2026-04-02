import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: false },
  imageUrl: { type: String },
  isRead: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

delete mongoose.models.Message;
export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
