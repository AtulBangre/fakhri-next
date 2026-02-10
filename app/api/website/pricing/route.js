
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const plans = await Plan.find({}).sort('sortOrder');
        return NextResponse.json(plans);
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

        const operations = data.map(plan => {
            if (plan._id) {
                return {
                    updateOne: {
                        filter: { _id: plan._id },
                        update: { $set: plan }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...plan,
                            planId: plan.planId || plan.id || `plan-${Date.now()}`
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Plan.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating plans:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
