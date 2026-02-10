
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageContent from '@/models/PageContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page');

        if (page) {
            const content = await PageContent.findOne({ page });
            return NextResponse.json(content || {});
        } else {
            const allContent = await PageContent.find({});
            return NextResponse.json(allContent);
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['super-admin', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await request.json();
        const { page, ...updateData } = data;

        if (!page) {
            return NextResponse.json({ error: 'Page identifier is required' }, { status: 400 });
        }

        const updatedContent = await PageContent.findOneAndUpdate(
            { page },
            { $set: updateData },
            { new: true, upsert: true }
        );

        return NextResponse.json(updatedContent);
    } catch (error) {
        console.error('Error updating page content:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
