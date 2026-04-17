import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClubApplication from '@/models/ClubApplication';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'You must be logged in to apply' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        // Check for existing application from same user to same club
        const existing = await ClubApplication.findOne({
            userId: currentUser.userId,
            clubId: body.clubId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existing) {
            return NextResponse.json(
                { error: existing.status === 'approved' ? 'You are already a member of this club' : 'You already have a pending application for this club' },
                { status: 400 }
            );
        }

        const newApplication = await ClubApplication.create({
            ...body,
            userId: currentUser.userId,
        });

        // Send notification to the student confirming submission
        await Notification.create({
            userId: currentUser.userId,
            title: "Application Submitted",
            message: `Your application to join ${body.clubName} has been submitted successfully. You will be notified once it is reviewed.`,
            type: "application",
            link: `/clubs/${body.clubId}`,
            clubName: body.clubName,
        });

        // Send notification to the club admin about the new application
        const clubAdmin = await User.findOne({ clubId: body.clubId, role: "club" });
        if (clubAdmin) {
            await Notification.create({
                userId: clubAdmin._id,
                title: "New Membership Request",
                message: `${body.studentName} has applied to join your club. Review their application in the dashboard.`,
                type: "application",
                link: `/club-dashboard/applications`,
                clubName: body.clubName,
            });
        }

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

export async function PUT(req) {
    try {
        await dbConnect();
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
        }

        const updatedApplication = await ClubApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedApplication) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Send notification to the student about the status update
        if (status === 'approved') {
            await Notification.create({
                userId: updatedApplication.userId,
                title: "Club Joining Request Approved! 🎉",
                message: `Congratulations! Your request to join ${updatedApplication.clubName} has been approved. Welcome to the club!`,
                type: "application",
                link: `/clubs/${updatedApplication.clubId}`,
                clubName: updatedApplication.clubName,
            });
        } else if (status === 'rejected') {
            await Notification.create({
                userId: updatedApplication.userId,
                title: "Club Application Update",
                message: `Your application to join ${updatedApplication.clubName} was not approved at this time.`,
                type: "application",
                link: `/clubs/${updatedApplication.clubId}`,
                clubName: updatedApplication.clubName,
            });
        }

        return NextResponse.json(updatedApplication, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update application' },
            { status: 500 }
        );
    }
}
