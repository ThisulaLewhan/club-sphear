import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClubApplication from '@/models/ClubApplication';

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const newApplication = await ClubApplication.create(body);

        return NextResponse.json(newApplication, { status: 201 });
    } catch (error) {
        console.error('Error creating club application:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit application' },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await dbConnect();

        // Example: Only club admins would hit this route to see pending applications.
        // We could extract query params like `?clubId=ieee`
        const { searchParams } = new URL(req.url);
        const clubId = searchParams.get('clubId');

        let filter = {};
        if (clubId) filter.clubId = clubId;

        const applications = await ClubApplication.find(filter).sort({ createdAt: -1 });

        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
