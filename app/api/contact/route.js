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
            interestedService: validation.data.service,
            message: validation.data.message,
            category: validation.data.category || 'general',
            priority: 'medium',
            status: 'new',
            isSpam,
            ipAddress: ip,
            userAgent,
            referrer,
        });

        // Send confirmation email to user
        const userEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EF4444;">Thank you for contacting Fakhri IT Services</h2>
                <p>Hi ${validation.data.name},</p>
                <p>We have received your message regarding <strong>${validation.data.subject || 'your inquiry'}</strong>.</p>
                <p>Here is a copy of your message:</p>
                <blockquote style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0;">
                    ${validation.data.message}
                </blockquote>
                <p>One of our team members will review your request and get back to you within 24-48 hours.</p>
                <p>Best regards,<br>Fakhri IT Services Team</p>
            </div>
        `;

        // Send notification email to admin
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3B82F6;">New Contact Message Received</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;">Name</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${validation.data.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;">Email</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${validation.data.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;">Subject</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${validation.data.subject || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;">Service</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${validation.data.service || 'N/A'}</td>
                    </tr>
                </table>
                <h3 style="margin-top: 20px;">Message:</h3>
                <blockquote style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3B82F6;">
                    ${validation.data.message}
                </blockquote>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Message ID: ${messageId} | IP: ${ip}</p>
            </div>
        `;

        // Import sendEmail dynamically to avoid import issues if not created before
        const { sendEmail } = await import('@/lib/email');

        // Send emails asynchronously (don't block response)
        Promise.allSettled([
            sendEmail({ to: validation.data.email, subject: 'We received your message - Fakhri IT Services', html: userEmailHtml }),
            sendEmail({ to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, subject: `New Contact: ${validation.data.subject || 'Inquiry'}`, html: adminEmailHtml })
        ]).then(results => {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Email ${index === 0 ? 'user' : 'admin'} delivery failed:`, result.reason);
                }
            });
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
