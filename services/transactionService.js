/**
 * Transaction Service
 * Business logic for payment transactions
 */

import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import { createError } from '@/middleware/errorHandler';
import { generateTransactionId } from '@/utils/generators';

export class TransactionService {
    /**
     * Create a new transaction
     */
    static async create(transactionData) {
        await dbConnect();

        const transactionId = generateTransactionId();

        const transaction = await Transaction.create({
            transactionId,
            ...transactionData,
            initiatedAt: new Date(),
        });

        return transaction;
    }

    /**
     * Get transaction by ID
     */
    static async getById(transactionId) {
        await dbConnect();
        const transaction = await Transaction.findById(transactionId)
            .populate('order')
            .populate('user', 'name email');

        if (!transaction) {
            throw createError.notFound('Transaction');
        }
        return transaction;
    }

    /**
     * Get transaction by transaction ID string
     */
    static async getByTransactionId(transactionIdString) {
        await dbConnect();
        const transaction = await Transaction.findOne({ transactionId: transactionIdString })
            .populate('order')
            .populate('user', 'name email');

        if (!transaction) {
            throw createError.notFound('Transaction');
        }
        return transaction;
    }

    /**
     * Get transaction by gateway transaction ID
     */
    static async getByGatewayId(gatewayTransactionId) {
        await dbConnect();
        return await Transaction.findOne({ gatewayTransactionId });
    }

    /**
     * Update transaction status
     */
    static async updateStatus(transactionId, status, additionalData = {}) {
        await dbConnect();

        const updateData = {
            status,
            ...additionalData,
        };

        if (status === 'success') {
            updateData.completedAt = new Date();
        }

        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { $set: updateData },
            { new: true }
        );

        if (!transaction) {
            throw createError.notFound('Transaction');
        }

        // Update associated order if transaction is successful
        if (status === 'success') {
            await Order.findByIdAndUpdate(transaction.order, {
                paymentStatus: 'paid',
                status: 'completed',
                completedDate: new Date(),
            });
        } else if (status === 'failed') {
            await Order.findByIdAndUpdate(transaction.order, {
                paymentStatus: 'failed',
            });
        }

        return transaction;
    }

    /**
     * Process refund
     */
    static async processRefund(transactionId, refundAmount, refundReason) {
        await dbConnect();

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw createError.notFound('Transaction');
        }

        if (transaction.status !== 'success') {
            throw createError.validation('Can only refund successful transactions');
        }

        if (refundAmount > transaction.amount - transaction.refundAmount) {
            throw createError.validation('Refund amount exceeds available amount');
        }

        const newRefundTotal = transaction.refundAmount + refundAmount;
        const newStatus = newRefundTotal >= transaction.amount ? 'refunded' : 'partially_refunded';

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            {
                $set: {
                    status: newStatus,
                    refundAmount: newRefundTotal,
                    refundReason,
                    refundDate: new Date(),
                },
            },
            { new: true }
        );

        // Update order status
        await Order.findByIdAndUpdate(transaction.order, {
            paymentStatus: newStatus,
        });

        return updatedTransaction;
    }

    /**
     * Get all transactions with filtering
     */
    static async getAll(filters = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 10,
            sort = { initiatedAt: -1 },
            userId,
            status,
            paymentGateway,
            startDate,
            endDate,
        } = filters;

        const query = {};

        if (userId) query.user = userId;
        if (status) query.status = status;
        if (paymentGateway) query.paymentGateway = paymentGateway;

        if (startDate || endDate) {
            query.initiatedAt = {};
            if (startDate) query.initiatedAt.$gte = new Date(startDate);
            if (endDate) query.initiatedAt.$lte = new Date(endDate);
        }

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('user', 'name email')
                .populate('order', 'orderId type planName')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get transactions by user
     */
    static async getByUser(userId) {
        await dbConnect();
        return await Transaction.find({ user: userId })
            .populate('order', 'orderId type planName total')
            .sort({ initiatedAt: -1 })
            .lean();
    }

    /**
     * Get transaction statistics
     */
    static async getStats(dateRange = 'month') {
        await dbConnect();

        const now = new Date();
        let startDate;

        switch (dateRange) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        const stats = await Transaction.aggregate([
            { $match: { initiatedAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        return stats.reduce((acc, item) => {
            acc[item._id] = { count: item.count, totalAmount: item.totalAmount };
            return acc;
        }, {});
    }

    /**
     * Verify Razorpay payment
     */
    static async verifyRazorpayPayment(orderId, paymentId, signature) {
        // This would typically use crypto to verify the signature
        // For now, we'll return a placeholder
        const crypto = await import('crypto');
        const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        return generated_signature === signature;
    }
}

export default TransactionService;
