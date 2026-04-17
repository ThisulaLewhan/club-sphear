import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClubApplication from '@/models/ClubApplication';
import { getCurrentUser } from '@/lib/auth';

// GET /api/applications/status?clubId=xxx
// Returns the current user's application status for a specific club
export async function GET(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ status: null }, { status: 200 });
        }

        const { searchParams } = new URL(req.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
        }

        await dbConnect();

        // Find the most recent application from this user for this club
        const application = await ClubApplication.findOne({
            userId: currentUser.userId,
            clubId: clubId,
        }).sort({ createdAt: -1 });

        if (!application) {
            return NextResponse.json({ status: null }, { status: 200 });
        }

        return NextResponse.json({ status: application.status }, { status: 200 });
    } catch (error) {
        console.error('Error checking application status:', error);
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }
}
