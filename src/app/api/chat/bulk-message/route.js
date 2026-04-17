import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== "club") {
      return Response.json({ success: false, message: "Only club accounts can send broadcasts" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return Response.json({ success: false, message: "Message cannot be empty" }, { status: 400 });
    }
    if (content.length > 200) {
      return Response.json({ success: false, message: "Message cannot exceed 200 characters" }, { status: 400 });
    }

    await connectDB();

    const students = await User.find({ role: "student", isBanned: { $ne: true } }).select("_id");

    if (students.length === 0) {
      return Response.json({ success: false, message: "No students found on the platform" }, { status: 404 });
    }

    let sentCount = 0;
    const BATCH_SIZE = 20;

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (student) => {
          try {
            let conversation = await Conversation.findOne({
              participants: { $all: [currentUser.userId, student._id] },
            });

            if (!conversation) {
              conversation = new Conversation({
                participants: [currentUser.userId, student._id],
                deletedBy: [],
              });
              await conversation.save();
            } else if (conversation.deletedBy && conversation.deletedBy.length > 0) {
              conversation.deletedBy = [];
              await conversation.save();
            }

            const message = new Message({
              conversationId: conversation._id,
              sender: currentUser.userId,
              content: content.trim(),
            });
            await message.save();

            conversation.lastMessage = message._id;
            conversation.updatedAt = new Date();
            conversation.deletedBy = [];
            await conversation.save();

            return true;
          } catch (err) {
            console.error(`Bulk message failed for student ${student._id}:`, err.message);
            return false;
          }
        })
      );

      sentCount += results.filter(Boolean).length;
    }

    return Response.json({
      success: true,
      sentCount,
      totalStudents: students.length,
    });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
