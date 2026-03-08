import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the notice'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Please provide content for the notice'],
    },
    author: {
        type: String, // Or ObjectId if you have a User model linked
        required: true,
    },
    club: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal',
    },
    expiresAt: {
        type: Date,
        // Optional: add a TTL index if you want MongoDB to automatically delete expired notices
    }
}, {
    timestamps: true,
});

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
