
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const members = await TeamMember.find({}).sort('sortOrder');
        return NextResponse.json(members);
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

        const operations = data.map(member => {
            if (member._id) {
                return {
                    updateOne: {
                        filter: { _id: member._id },
                        update: { $set: member }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...member,
                            sortOrder: member.sortOrder || 0
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await TeamMember.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
