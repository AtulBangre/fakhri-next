
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const testimonials = await Testimonial.find({}).sort('sortOrder');
        return NextResponse.json(testimonials);
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

        const operations = data.map(t => {
            if (t._id) {
                return {
                    updateOne: {
                        filter: { _id: t._id },
                        update: { $set: t }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...t,
                            sortOrder: t.sortOrder || 0,
                            isActive: t.isActive !== undefined ? t.isActive : true
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Testimonial.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating testimonials:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
