import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notice from '@/models/Notice';

export async function GET() {
    try {
        await connectDB();
        const notices = await Notice.find({}).sort({ createdAt: -1 });
        return NextResponse.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        // In a real app, author/club would come from the authenticated session
        const doc = {
            title: body.title,
            content: body.content,
            author: body.author || 'Club Admin',
            club: body.club || 'Computer Science Society',
            priority: body.priority || 'normal',
            expiresAt: body.expiresAt || null,
        };

        const newNotice = await Notice.create(doc);
        return NextResponse.json(newNotice, { status: 201 });
    } catch (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ error: 'Failed to create notice', details: error.message }, { status: 500 });
    }
}
