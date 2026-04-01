// Feature Domain: Club Management & Operations

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notice from '@/models/Notice';
import Club from '@/models/Club';
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const notices = await Notice.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
        return NextResponse.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
    }
}

// CREATE notice — only authenticated club accounts
export async function POST(request) {
    try {
        const caller = await getCurrentUser();
        if (!caller || caller.role !== 'club' || !caller.clubId) {
            return NextResponse.json({ error: 'Unauthorized: Only registered Clubs can create notices.' }, { status: 403 });
        }

        await connectDB();

        // Resolve the club's real name from the database
        const club = await Club.findById(caller.clubId).lean();
        if (!club) {
            return NextResponse.json({ error: 'Club account not found.' }, { status: 404 });
        }

        const body = await request.json();

        // validate notice creation fields
        if (!body.title || !body.title.trim() || !body.content || !body.content.trim()) {
            return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
        }
        if (body.title.length > 100) {
            return NextResponse.json({ error: "Notice title cannot exceed 100 characters." }, { status: 400 });
        }
        if (body.content.length > 1000) {
            return NextResponse.json({ error: "Notice content cannot exceed 1000 characters." }, { status: 400 });
        }
        if (!body.expiresAt) {
            return NextResponse.json({ error: "Expiration date is required." }, { status: 400 });
        }
        const expirationDate = new Date(body.expiresAt);
        if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
            return NextResponse.json({ error: "Expiration date must be a valid future date." }, { status: 400 });
        }

        const doc = {
            title: body.title,
            content: body.content,
            author: caller.email, // Use authenticated email
            club: club.name,      // Use the real club name from DB
            priority: body.priority || 'normal',
            expiresAt: expirationDate,
        };

        const newNotice = await Notice.create(doc);

        // Trigger Notifications for all active users
        try {
            const users = await User.find({ role: { $in: ["student", "club"] } }).select("_id");
            console.log(`[DEBUG] Found ${users.length} users for notice notifications.`);
            if (users.length > 0) {
                const notifications = users
                    .map(u => ({
                        userId: u._id,
                        title: `New Notice: ${body.title}`,
                        message: `Important update from ${club.name}`,
                        type: "notice",
                        link: `/clubs/${caller.clubId}`,
                        clubName: club.name
                    }));
                if (notifications.length > 0) {
                    const result = await Notification.insertMany(notifications);
                    console.log(`[DEBUG] Successfully inserted ${result.length} notifications.`);
                }
            }
        } catch (notifyError) {
            console.error("Failed to trigger notice notifications:", notifyError);
        }

        return NextResponse.json(newNotice, { status: 201 });
    } catch (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ error: 'Failed to create notice', details: error.message }, { status: 500 });
    }
}
