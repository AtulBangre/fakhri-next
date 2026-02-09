import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import crypto from 'crypto';

// Helper to add months
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// Helper to generate transaction ID
const generateTransactionId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TXN-${timestamp}-${random}`;
};

// GET /api/transactions - Get all transactions
export async function GET(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const paymentGateway = searchParams.get('gateway');

        await dbConnect();

        const query = {};

        // Clients can only see their own transactions
        if (auth.user.role === 'client') {
            query.user = auth.user.id;
        }

        if (status) query.status = status;
        if (paymentGateway) query.paymentGateway = paymentGateway;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('user', 'name email')
                .populate('order', 'orderId type planName total')
                .sort({ initiatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query),
        ]);

        // Format transactions for frontend
        const formattedTransactions = transactions.map(txn => ({
            id: txn._id,
            transactionId: txn.transactionId,
            order: txn.order ? {
                id: txn.order._id,
                orderId: txn.order.orderId,
                type: txn.order.type,
                planName: txn.order.planName,
                total: txn.order.total,
            } : null,
            user: txn.user ? {
                id: txn.user._id,
                name: txn.user.name,
                email: txn.user.email,
            } : null,
            amount: txn.amount,
            currency: txn.currency || 'INR',
            status: txn.status,
            paymentGateway: txn.paymentGateway,
            paymentMethod: txn.paymentMethod,
            paymentMethodDetails: txn.paymentMethodDetails,
            gatewayTransactionId: txn.gatewayTransactionId,
            initiatedAt: txn.initiatedAt,
            completedAt: txn.completedAt,
            refundAmount: txn.refundAmount,
            refundReason: txn.refundReason,
        }));

        return NextResponse.json({
            success: true,
            data: formattedTransactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        return apiError('Failed to fetch transactions', 500);
    }
}

// POST /api/transactions - Initialize payment
export async function POST(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return apiError('Order ID is required', 400);
        }

        await dbConnect();

        // Find order
        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return apiError('Order not found', 404);
        }

        // Verify order belongs to user
        if (order.user._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        // Check if order is already paid
        if (order.paymentStatus === 'paid') {
            return apiError('Order is already paid', 400);
        }

        // Generate transaction ID
        const transactionId = generateTransactionId();

        // Create transaction record
        const transaction = await Transaction.create({
            transactionId,
            order: order._id,
            user: auth.user.id,
            amount: order.total,
            currency: 'INR',
            paymentGateway: 'razorpay',
            status: 'initiated',
            initiatedAt: new Date(),
        });

        // In production, create Razorpay order here
        // const Razorpay = require('razorpay');
        // const razorpay = new Razorpay({
        //     key_id: process.env.RAZORPAY_KEY_ID,
        //     key_secret: process.env.RAZORPAY_KEY_SECRET,
        // });
        // const razorpayOrder = await razorpay.orders.create({
        //     amount: order.total * 100, // in paise
        //     currency: 'INR',
        //     receipt: transactionId,
        // });

        // For now, return mock Razorpay order
        const paymentResponse = {
            transactionId: transaction.transactionId,
            orderId: order.orderId,
            amount: order.total,
            amountInPaise: order.total * 100,
            currency: 'INR',
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
            razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, // Mock
            customerName: order.billingAddress?.name || auth.user.name,
            customerEmail: order.billingAddress?.email || auth.user.email,
            customerPhone: order.billingAddress?.phone || '',
            description: `Payment for ${order.planName || 'Order'} - ${order.orderId}`,
        };

        return apiSuccess(paymentResponse, 'Payment initialized');

    } catch (error) {
        console.error('Initialize payment error:', error);
        return apiError('Failed to initialize payment', 500);
    }
}
