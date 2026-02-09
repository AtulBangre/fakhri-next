/**
 * Contact Service
 * Business logic for contact messages
 */

import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { createError } from '@/middleware/errorHandler';
import { generateId } from '@/utils/generators';

export class ContactService {
    /**
     * Create a new contact message
     */
    static async create(messageData) {
        await dbConnect();

        const count = await ContactMessage.countDocuments();
        const messageId = generateId('MSG', count + 1);

        // Simple spam detection
        const spamScore = this.calculateSpamScore(messageData);

        const message = await ContactMessage.create({
            messageId,
            ...messageData,
            spamScore,
            isSpam: spamScore > 7,
            status: spamScore > 7 ? 'spam' : 'new',
        });

        return message;
    }

    /**
     * Calculate spam score
     */
    static calculateSpamScore(data) {
        let score = 0;

        // Check for common spam patterns
        const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'prize', 'free money'];
        const content = `${data.subject} ${data.message}`.toLowerCase();

        spamKeywords.forEach((keyword) => {
            if (content.includes(keyword)) score += 2;
        });

        // Check for excessive links
        const urlCount = (content.match(/https?:\/\//g) || []).length;
        if (urlCount > 3) score += 3;

        // Check for ALL CAPS in subject
        if (data.subject === data.subject.toUpperCase() && data.subject.length > 10) {
            score += 1;
        }

        return Math.min(score, 10);
    }

    /**
     * Get message by ID
     */
    static async getById(messageId) {
        await dbConnect();
        const message = await ContactMessage.findById(messageId)
            .populate('assignedTo', 'name email');

        if (!message) {
            throw createError.notFound('Message');
        }
        return message;
    }

    /**
     * Update message status
     */
    static async updateStatus(messageId, status) {
        await dbConnect();

        const updateData = { status };
        if (status === 'resolved') {
            updateData.resolvedAt = new Date();
        }

        const message = await ContactMessage.findByIdAndUpdate(
            messageId,
            { $set: updateData },
            { new: true }
        );

        if (!message) {
            throw createError.notFound('Message');
        }
        return message;
    }

    /**
     * Assign message to user
     */
    static async assign(messageId, userId, userName) {
        await dbConnect();
        return await ContactMessage.findByIdAndUpdate(
            messageId,
            {
                assignedTo: userId,
                assignedToName: userName,
                status: 'in-progress',
            },
            { new: true }
        );
    }

    /**
     * Add response to message
     */
    static async addResponse(messageId, responseData) {
        await dbConnect();

        const message = await ContactMessage.findById(messageId);
        if (!message) {
            throw createError.notFound('Message');
        }

        const isFirstResponse = message.responses.length === 0;

        message.responses.push(responseData);

        if (isFirstResponse) {
            message.firstResponseAt = new Date();
        }

        message.status = 'responded';

        await message.save();
        return message;
    }

    /**
     * Add internal note
     */
    static async addNote(messageId, noteData) {
        await dbConnect();

        return await ContactMessage.findByIdAndUpdate(
            messageId,
            {
                $push: { internalNotes: noteData },
            },
            { new: true }
        );
    }

    /**
     * Get all messages with filtering
     */
    static async getAll(filters = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            status,
            category,
            priority,
            assignedTo,
            isSpam,
            search,
        } = filters;

        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (typeof isSpam === 'boolean') query.isSpam = isSpam;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
            ];
        }

        const [messages, total] = await Promise.all([
            ContactMessage.find(query)
                .populate('assignedTo', 'name email')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ContactMessage.countDocuments(query),
        ]);

        return {
            messages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get message statistics
     */
    static async getStats() {
        await dbConnect();

        const [statusCounts, priorityCounts, todayCount] = await Promise.all([
            ContactMessage.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            ContactMessage.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]),
            ContactMessage.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            }),
        ]);

        return {
            byStatus: statusCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byPriority: priorityCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            todayCount,
            total: await ContactMessage.countDocuments(),
        };
    }

    /**
     * Mark message as spam
     */
    static async markAsSpam(messageId) {
        await dbConnect();
        return await ContactMessage.findByIdAndUpdate(
            messageId,
            { isSpam: true, status: 'spam' },
            { new: true }
        );
    }

    /**
     * Archive message
     */
    static async archive(messageId) {
        await dbConnect();
        return await ContactMessage.findByIdAndUpdate(
            messageId,
            { status: 'archived' },
            { new: true }
        );
    }
}

export default ContactService;
