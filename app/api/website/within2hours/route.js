
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find({ isWithin2Hours: true }).sort('sortOrder');
        return NextResponse.json(products);
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

        const operations = data.map(p => {
            if (p._id) {
                return {
                    updateOne: {
                        filter: { _id: p._id },
                        update: { $set: p }
                    }
                };
            } else {
                return {
                    insertOne: {
                        document: {
                            ...p,
                            isWithin2Hours: true,
                            productId: p.productId || `prod-${Date.now()}`,
                            sortOrder: p.sortOrder || 0
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Product.bulkWrite(operations);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating within2hours products:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
