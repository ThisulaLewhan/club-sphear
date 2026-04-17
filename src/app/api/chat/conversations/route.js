import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import Club from "@/models/Club";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    const conversations = await Conversation.find({ 
        participants: currentUser.userId,
        deletedBy: { $ne: currentUser.userId }
    })
      .populate("participants", "name role clubId logo") 
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
        const c = conv.toObject();
        c.participants = await Promise.all(c.participants.map(async (p) => {
            if (p.role === "club" && p.clubId) {
                const clubData = await Club.findById(p.clubId).select("logo");
                if (clubData && clubData.logo) p.logo = clubData.logo;
            }
            return p;
        }));
        
        c.unreadCount = await Message.countDocuments({
            conversationId: c._id,
            sender: { $ne: currentUser.userId },
            isRead: false
        });

        return c;
    }));

    return Response.json({ success: true, conversations: enrichedConversations });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { participantId } = body;

    if (!participantId) return Response.json({ success: false, message: "Missing participantId" }, { status: 400 });

    await connectDB();

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser.userId, participantId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUser.userId, participantId],
        deletedBy: []
      });
      await conversation.save();
    } else {
      // If conversation exists but was deleted by someone, clear that user from deletedBy
      if (conversation.deletedBy && conversation.deletedBy.length > 0) {
        conversation.deletedBy = [];
        await conversation.save();
      }
    }

    return Response.json({ success: true, conversation });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) return Response.json({ success: false, message: "Missing conversationId" }, { status: 400 });

    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return Response.json({ success: false, message: "Conversation not found" }, { status: 404 });

    // Verify user is a participant using toString() comparison
    const isParticipant = conversation.participants.some(p => p.toString() === currentUser.userId);
    if (!isParticipant) {
      return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Add user to deletedBy if not already there
    const alreadyDeleted = conversation.deletedBy.some(p => p.toString() === currentUser.userId);
    if (!alreadyDeleted) {
      conversation.deletedBy.push(currentUser.userId);
    }

    // Also add user to deletedBy for all messages in this conversation
    await Message.updateMany(
      { conversationId, deletedBy: { $ne: currentUser.userId } },
      { $push: { deletedBy: currentUser.userId } }
    );

    // If all participants have deleted it, hard delete
    const allParticipantsDeleted = conversation.participants.every(p => 
      conversation.deletedBy.some(dbId => dbId.toString() === p.toString())
    );

    if (allParticipantsDeleted) {
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
      return Response.json({ success: true, message: "Conversation permanently deleted" });
    } else {
      await conversation.save();
      return Response.json({ success: true, message: "Conversation hidden for you" });
    }
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
