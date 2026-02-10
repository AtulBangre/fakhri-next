
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Faq from '@/models/Faq';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const faqs = await Faq.find({}).sort('sortOrder');
        return NextResponse.json(faqs);
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

        const operations = data.map(faq => {
            if (faq._id) {
                return {
                    updateOne: {
                        filter: { _id: faq._id },
                        update: { $set: faq }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...faq,
                            sortOrder: faq.sortOrder || 0
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Faq.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating faqs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
