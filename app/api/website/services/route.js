
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const services = await Service.find({}).sort('sortOrder');
        return NextResponse.json(services);
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

        // Data is expected to be an array of services
        // We can use bulkWrite to update them
        // Or simple strategy: loop and update/create.
        // For simplicity and matching the "Save Changes" UI which sends the full state:

        // 1. Get IDs of services in the request
        const serviceIds = data.map(s => s._id).filter(id => id);

        // 2. Delete services not in the request (optional, if we treat this as a sync)
        // However, safely we should probably just upsert.

        const operations = data.map(service => {
            if (service._id) {
                return {
                    updateOne: {
                        filter: { _id: service._id },
                        update: { $set: service }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...service,
                            serviceId: service.serviceId || service.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            category: service.category || 'Other'
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Service.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating services:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
