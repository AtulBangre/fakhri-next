/**
 * Order Service
 * Business logic for order operations
 */

import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Plan from '@/models/Plan';
import User from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { generateOrderNumber, generateId } from '@/utils/generators';
import { calculateTotalWithTax, addMonths } from '@/utils';

export class OrderService {
    /**
     * Create a new order
     */
    static async create(orderData) {
        await dbConnect();

        const orderId = generateOrderNumber(await Order.countDocuments() + 1);

        // If subscription order, get plan details
        let planDetails = null;
        if (orderData.type === 'subscription' && orderData.planId) {
            planDetails = await Plan.findOne({ planId: orderData.planId });
            if (!planDetails) {
                throw createError.notFound('Plan');
            }
        }

        const order = await Order.create({
            orderId,
            ...orderData,
            plan: planDetails?._id,
            planName: planDetails?.name,
            orderDate: new Date(),
        });

        return order;
    }

    /**
     * Get order by ID
     */
    static async getById(orderId) {
        await dbConnect();
        const order = await Order.findById(orderId)
            .populate('user', 'name email company')
            .populate('plan', 'name price');

        if (!order) {
            throw createError.notFound('Order');
        }
        return order;
    }

    /**
     * Get order by order ID string
     */
    static async getByOrderId(orderIdString) {
        await dbConnect();
        const order = await Order.findOne({ orderId: orderIdString })
            .populate('user', 'name email company')
            .populate('plan', 'name price');

        if (!order) {
            throw createError.notFound('Order');
        }
        return order;
    }

    /**
     * Update order status
     */
    static async updateStatus(orderId, status, paymentStatus = null) {
        await dbConnect();

        const updateData = { status };
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (status === 'completed') updateData.completedDate = new Date();

        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            { new: true }
        );

        if (!order) {
            throw createError.notFound('Order');
        }

        // If subscription order is completed, update user's plan
        if (status === 'completed' && order.type === 'subscription') {
            await User.findByIdAndUpdate(order.user, {
                plan: order.plan,
                planName: order.planName,
                planStartDate: order.subscriptionStartDate || new Date(),
                planEndDate: order.subscriptionEndDate || addMonths(new Date(), order.planDuration || 1),
                status: 'active',
            });
        }

        return order;
    }

    /**
     * Get all orders with filtering
     */
    static async getAll(filters = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 10,
            sort = { orderDate: -1 },
            userId,
            status,
            paymentStatus,
            type,
            startDate,
            endDate,
        } = filters;

        const query = {};

        if (userId) query.user = userId;
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (type) query.type = type;

        if (startDate || endDate) {
            query.orderDate = {};
            if (startDate) query.orderDate.$gte = new Date(startDate);
            if (endDate) query.orderDate.$lte = new Date(endDate);
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email company')
                .populate('plan', 'name price')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get orders by user
     */
    static async getByUser(userId) {
        await dbConnect();
        return await Order.find({ user: userId })
            .populate('plan', 'name price')
            .sort({ orderDate: -1 })
            .lean();
    }

    /**
     * Calculate order totals
     */
    static calculateTotals(subtotal, discountAmount = 0, taxRate = 18) {
        const discount = discountAmount;
        const taxableAmount = subtotal - discount;
        const tax = Math.round((taxableAmount * taxRate) / 100);
        const total = taxableAmount + tax;

        return { subtotal, discount, tax, total };
    }

    /**
     * Create subscription order
     */
    static async createSubscription(userId, planId, billingAddress, duration = 1) {
        await dbConnect();

        const plan = await Plan.findOne({ planId });
        if (!plan) {
            throw createError.notFound('Plan');
        }

        const subtotal = plan.price * duration;
        const { tax, total } = calculateTotalWithTax(subtotal);

        const startDate = new Date();
        const endDate = addMonths(startDate, duration);

        return await this.create({
            user: userId,
            type: 'subscription',
            planId: plan.planId,
            planDuration: duration,
            subtotal,
            tax,
            total,
            billingAddress,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
        });
    }

    /**
     * Get order statistics
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

        const stats = await Order.aggregate([
            { $match: { orderDate: { $gte: startDate }, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' },
                },
            },
        ]);

        return stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }
}

export default OrderService;
