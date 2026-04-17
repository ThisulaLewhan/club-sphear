import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["post", "notice", "event", "application", "system"],
        default: "system"
    },
    link: {
        type: String,
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false
    },
    clubName: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
