import mongoose from 'mongoose';

const ClubApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clubId: {
        type: String,
        required: true,
    },
    clubName: {
        type: String, // E.g. 'IEEE', 'Rotaract'
        required: true,
    },
    studentName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true,
    },
    studentId: {
        type: String,
        required: [true, 'Please provide your student ID'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your university email'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please provide your contact number'],
        trim: true,
    },
    department: {
        type: String,
        required: true,
    },
    yearOfStudy: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }
}, {
    timestamps: true,
});

export default mongoose.models.ClubApplication || mongoose.model('ClubApplication', ClubApplicationSchema);
