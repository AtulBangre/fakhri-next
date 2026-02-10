
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const jobs = await Job.find({ isActive: true }).sort('sortOrder');
        return NextResponse.json(jobs);
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

        const operations = data.map(job => {
            if (job._id) {
                return {
                    updateOne: {
                        filter: { _id: job._id },
                        update: { $set: job }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...job,
                            isActive: job.isActive !== undefined ? job.isActive : true,
                            sortOrder: job.sortOrder || 0
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Job.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating jobs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
