import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireRole } from '@/middleware/auth';

// POST /api/contact/[id]/respond - Add response to message
export async function POST(request, { params }) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const { message: responseMessage, method = 'email' } = body;

        if (!responseMessage) {
            return apiError('Response message is required', 400);
        }

        await dbConnect();

        const contactMessage = await ContactMessage.findById(id);

        if (!contactMessage) {
            return apiError('Message not found', 404);
        }

        // Add response
        const response = {
            respondedBy: auth.user.id,
            respondedByName: auth.user.name,
            message: responseMessage,
            method,
            createdAt: new Date(),
        };

        contactMessage.responses.push(response);
        contactMessage.status = 'responded';
        await contactMessage.save();

        return apiSuccess({
            id: contactMessage._id,
            responseCount: contactMessage.responses.length,
            status: contactMessage.status,
        }, 'Response added successfully');

    } catch (error) {
        console.error('Add response error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid message ID', 400);
        }

        return apiError('Failed to add response', 500);
    }
}
