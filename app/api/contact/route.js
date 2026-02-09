import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireRole } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import { withRateLimit } from '@/middleware/rateLimit';

// Helper to generate message ID
const generateMessageId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MSG-${timestamp}-${random}`;
};

// Helper to check for spam indicators
const checkSpamIndicators = (data) => {
    const spamPatterns = [
        /\b(viagra|casino|lottery|winner|inheritance|nigerian prince)\b/i,
        /click here/i,
        /http[s]?:\/\/[^\s]+/gi, // Multiple URLs
    ];

    const messageText = `${data.name} ${data.email} ${data.subject || ''} ${data.message}`;
    let urlCount = (messageText.match(/http[s]?:\/\//gi) || []).length;

    for (const pattern of spamPatterns) {
        if (pattern.test(messageText)) {
            return true;
        }
    }

    // More than 2 URLs is suspicious
    if (urlCount > 2) {
        return true;
    }

    return false;
};

// GET /api/contact - Get all contact messages (Admin only)
export async function GET(request) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const priority = searchParams.get('priority');
        const isSpam = searchParams.get('spam');
        const search = searchParams.get('search');

        await dbConnect();

        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (isSpam === 'true') query.isSpam = true;
        if (isSpam === 'false') query.isSpam = { $ne: true };

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        const [messages, total] = await Promise.all([
            ContactMessage.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ContactMessage.countDocuments(query),
        ]);

        // Format messages for frontend
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            messageId: msg.messageId,
            name: msg.name,
            email: msg.email,
            phone: msg.phone,
            company: msg.company,
            subject: msg.subject,
            message: msg.message,
            category: msg.category,
            priority: msg.priority,
            status: msg.status,
            isSpam: msg.isSpam,
            assignedTo: msg.assignedToName,
            responseCount: msg.responses?.length || 0,
            lastResponse: msg.responses?.length > 0
                ? msg.responses[msg.responses.length - 1].createdAt
                : null,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }));

        return NextResponse.json({
            success: true,
            data: formattedMessages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Get contact messages error:', error);
        return apiError('Failed to fetch messages', 500);
    }
}

// POST /api/contact - Submit contact form (Public)
export async function POST(request) {
    try {
        // Rate limiting for contact form
        const rateLimitError = await withRateLimit(request, 'contact');
        if (rateLimitError) return rateLimitError;

        const body = await request.json();

        // Validate input
        const validation = validateBody(body, schemas.contactMessage);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        await dbConnect();

        // Get request metadata
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        const userAgent = request.headers.get('user-agent');
        const referrer = request.headers.get('referer');

        // Check for spam
        const isSpam = checkSpamIndicators(validation.data);

        // Generate message ID
        const messageId = generateMessageId();

        // Create contact message
        const message = await ContactMessage.create({
            messageId,
            name: validation.data.name,
            email: validation.data.email,
            phone: validation.data.phone || '',
            company: validation.data.company || '',
            subject: validation.data.subject || 'General Inquiry',
            message: validation.data.message,
            category: validation.data.category || 'general',
            priority: 'medium',
            status: 'new',
            isSpam,
            ipAddress: ip,
            userAgent,
            referrer,
        });

        // Response for frontend
        return apiSuccess(
            {
                messageId: message.messageId,
                status: 'submitted',
            },
            'Thank you for contacting us! We will get back to you within 24-48 hours.',
            201
        );

    } catch (error) {
        console.error('Submit contact form error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to submit your message. Please try again.', 500);
    }
}
