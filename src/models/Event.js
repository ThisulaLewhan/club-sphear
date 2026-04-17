import mongoose from "mongoose";

// Next.js hot reload caches Mongoose models which strips newly added fields
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  imageUrl: { type: String, required: false },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  registrationLink: String,
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  pendingEdit: {
    type: {
      title: String,
      description: String,
      date: Date,
      startTime: String,
      endTime: String,
      venue: String,
      registrationLink: String,
      imageUrl: String,
      submittedAt: { type: Date, default: Date.now }
    },
    default: null
  },
  editRejected: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);