import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    try {
        await dbConnect();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Database connection failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
