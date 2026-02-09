/**
 * Contact Controller
 * Handle HTTP requests for contact messages
 */

import { ContactService } from '@/services/contactService';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { withRateLimit } from '@/middleware/rateLimit';

export const ContactController = {
    /**
     * Submit contact form (Public)
     */
    submit: asyncHandler(async (request, body) => {
        // Rate limiting for contact form
        const rateLimitError = await withRateLimit(request, 'contact');
        if (rateLimitError) return rateLimitError;

        const validation = validateBody(body, schemas.contactMessage);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        // Get metadata
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        const userAgent = request.headers.get('user-agent');
        const referrer = request.headers.get('referer');

        const messageData = {
            ...validation.data,
            ipAddress: ip,
            userAgent,
            referrer,
        };

        const message = await ContactService.create(messageData);

        return apiSuccess(
            { messageId: message.messageId },
            'Thank you for contacting us. We will get back to you soon.',
            201
        );
    }),

    /**
     * Get all messages
     */
    getAll: asyncHandler(async (searchParams) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            status: searchParams.get('status'),
            category: searchParams.get('category'),
            priority: searchParams.get('priority'),
            isSpam: searchParams.get('spam') === 'true' ? true :
                searchParams.get('spam') === 'false' ? false : undefined,
            search: searchParams.get('search'),
        };

        const result = await ContactService.getAll(filters);
        return apiPaginated(
            result.messages,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    }),

    /**
     * Get message by ID
     */
    getById: asyncHandler(async (messageId) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const message = await ContactService.getById(messageId);
        return apiSuccess(message);
    }),

    /**
     * Update message status
     */
    updateStatus: asyncHandler(async (messageId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const message = await ContactService.updateStatus(messageId, body.status);
        return apiSuccess(message, 'Status updated successfully');
    }),

    /**
     * Assign message
     */
    assign: asyncHandler(async (messageId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { userId, userName } = body;
        const message = await ContactService.assign(messageId, userId, userName);
        return apiSuccess(message, 'Message assigned successfully');
    }),

    /**
     * Add response to message
     */
    addResponse: asyncHandler(async (messageId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const responseData = {
            respondedBy: auth.user.id,
            respondedByName: auth.user.name,
            message: body.message,
            method: body.method || 'email',
        };

        const message = await ContactService.addResponse(messageId, responseData);
        return apiSuccess(message, 'Response added successfully');
    }),

    /**
     * Add internal note
     */
    addNote: asyncHandler(async (messageId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const noteData = {
            note: body.note,
            addedBy: auth.user.id,
            addedByName: auth.user.name,
        };

        const message = await ContactService.addNote(messageId, noteData);
        return apiSuccess(message, 'Note added successfully');
    }),

    /**
     * Mark as spam
     */
    markAsSpam: asyncHandler(async (messageId) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const message = await ContactService.markAsSpam(messageId);
        return apiSuccess(message, 'Marked as spam');
    }),

    /**
     * Archive message
     */
    archive: asyncHandler(async (messageId) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const message = await ContactService.archive(messageId);
        return apiSuccess(message, 'Message archived');
    }),

    /**
     * Get statistics
     */
    getStats: asyncHandler(async () => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const stats = await ContactService.getStats();
        return apiSuccess(stats);
    }),
};

export default ContactController;
