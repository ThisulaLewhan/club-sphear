import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email address format." },
                { status: 400 }
            );
        }

        if (message.length < 10) {
            return NextResponse.json(
                { success: false, error: "Message must be at least 10 characters long." },
                { status: 400 }
            );
        }

        // Create new contact message
        const newMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message,
        });

        return NextResponse.json({
            success: true,
            data: newMessage,
            message: "Your message has been submitted successfully.",
        });
    } catch (error) {
        console.error("Error submitting contact message:", error);
        return NextResponse.json(
            { success: false, error: "Server error occurred. Please try again." },
            { status: 500 }
        );
    }
}
