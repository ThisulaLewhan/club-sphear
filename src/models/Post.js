import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 500,
    },
    clubName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);