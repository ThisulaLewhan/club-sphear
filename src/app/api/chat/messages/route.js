import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getCurrentUser } from "@/lib/auth";
import { validateChatMessage } from "@/lib/validations";
import fs from "fs/promises";
import path from "path";

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) return Response.json({ success: false, message: "Missing params" }, { status: 400 });

    await connectDB();

    await Message.updateMany(
      { conversationId, sender: { $ne: currentUser.userId }, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ 
        conversationId,
        deletedBy: { $ne: currentUser.userId }
    }).sort({ createdAt: 1 });
    return Response.json({ success: true, messages });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    let conversationId, content, imageFile;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      conversationId = formData.get("conversationId");
      content = formData.get("content");
      imageFile = formData.get("image");
    } else {
      const body = await request.json();
      conversationId = body.conversationId;
      content = body.content;
    }

    const validation = validateChatMessage({ conversationId, content, image: imageFile });
    if (!validation.valid) {
      return Response.json(
        { success: false, message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    await connectDB();

    let imageUrl = null;
    if (imageFile && imageFile.size > 0 && typeof imageFile !== "string") {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const extension = path.extname(imageFile.name) || ".jpg";
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/chat");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/uploads/chat/${filename}`;
      } catch (fsError) {
        console.error("Failed to save chat image:", fsError);
      }
    }

    const message = new Message({
      conversationId,
      sender: currentUser.userId,
      content: content || "",
      imageUrl,
    });
    
    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, { 
        lastMessage: message._id,
        updatedAt: new Date(),
        deletedBy: [] // Restore visibility for anyone who deleted the chat
    });

    return Response.json({ success: true, message });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false }, { status: 401 });

    const body = await request.json();
    const { messageId, content } = body;

    if (!messageId || !content) {
      return Response.json({ success: false, message: "Missing messageId or content" }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return Response.json({ success: false, message: "Message cannot be empty" }, { status: 400 });
    }
    if (content.length > 200) {
      return Response.json({ success: false, message: "Message cannot exceed 200 characters" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(messageId);
    if (!message) return Response.json({ success: false, message: "Message not found" }, { status: 404 });
    if (message.sender.toString() !== currentUser.userId) {
      return Response.json({ success: false, message: "You can only edit your own messages" }, { status: 403 });
    }
    if (message.isDeleted) {
      return Response.json({ success: false, message: "Cannot edit a deleted message" }, { status: 400 });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return Response.json({ success: true, message });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ success: false }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) return Response.json({ success: false, message: "Missing messageId" }, { status: 400 });

    await connectDB();

    const message = await Message.findById(messageId);
    if (!message) return Response.json({ success: false, message: "Message not found" }, { status: 404 });
    if (message.sender.toString() !== currentUser.userId) {
      return Response.json({ success: false, message: "You can only delete your own messages" }, { status: 403 });
    }

    message.content = "This message was deleted";
    message.isDeleted = true;
    message.isEdited = false;
    await message.save();

    return Response.json({ success: true, message });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
