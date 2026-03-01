import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  registrationLink: String,
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);