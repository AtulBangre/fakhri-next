import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';

// GET /api/contact/[id] - Get message by ID
export async function GET(request, { params }) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        await dbConnect();

        const message = await ContactMessage.findById(id).lean();

        if (!message) {
            return apiError('Message not found', 404);
        }

        // Mark as read if not already
        if (message.status === 'new') {
            await ContactMessage.findByIdAndUpdate(id, { status: 'read' });
        }

        // Format response
        const messageResponse = {
            id: message._id,
            messageId: message.messageId,
            name: message.name,
            email: message.email,
            phone: message.phone,
            company: message.company,
            subject: message.subject,
            message: message.message,
            category: message.category,
            priority: message.priority,
            status: message.status,
            isSpam: message.isSpam,
            isArchived: message.isArchived,
            assignedTo: message.assignedTo,
            assignedToName: message.assignedToName,
            responses: message.responses || [],
            notes: message.notes || [],
            ipAddress: message.ipAddress,
            referrer: message.referrer,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };

        return apiSuccess(messageResponse);

    } catch (error) {
        console.error('Get contact message error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid message ID', 400);
        }

        return apiError('Failed to fetch message', 500);
    }
}

// PUT /api/contact/[id] - Update message (status, assignment, etc.)
export async function PUT(request, { params }) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const { status, priority, category, assignedTo, assignedToName, isSpam } = body;

        await dbConnect();

        const updateData = {};

        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (category) updateData.category = category;
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo;
            updateData.assignedToName = assignedToName;
            updateData.assignedDate = new Date();
        }
        if (typeof isSpam === 'boolean') updateData.isSpam = isSpam;

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!message) {
            return apiError('Message not found', 404);
        }

        return apiSuccess({
            id: message._id,
            messageId: message.messageId,
            status: message.status,
            priority: message.priority,
            assignedToName: message.assignedToName,
        }, 'Message updated successfully');

    } catch (error) {
        console.error('Update contact message error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid message ID', 400);
        }

        return apiError('Failed to update message', 500);
    }
}

// DELETE /api/contact/[id] - Archive or delete message
export async function DELETE(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const permanent = searchParams.get('permanent') === 'true';

        await dbConnect();

        if (permanent) {
            const result = await ContactMessage.findByIdAndDelete(id);
            if (!result) {
                return apiError('Message not found', 404);
            }
            return apiSuccess(null, 'Message deleted permanently');
        } else {
            const message = await ContactMessage.findByIdAndUpdate(
                id,
                { isArchived: true, archivedDate: new Date() },
                { new: true }
            );

            if (!message) {
                return apiError('Message not found', 404);
            }

            return apiSuccess(null, 'Message archived successfully');
        }

    } catch (error) {
        console.error('Delete contact message error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid message ID', 400);
        }

        return apiError('Failed to delete message', 500);
    }
}
