import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth } from '@/middleware/auth';
import crypto from 'crypto';

// Helper to add months
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// POST /api/transactions/verify - Verify Razorpay payment
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            transactionId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = body;

        if (!transactionId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return apiError('Missing payment verification parameters', 400);
        }

        await dbConnect();

        // Find transaction
        const transaction = await Transaction.findOne({ transactionId });

        if (!transaction) {
            return apiError('Transaction not found', 404);
        }

        // Verify signature
        const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const isSignatureValid = generated_signature === razorpay_signature;

        if (!isSignatureValid) {
            // Update transaction as failed
            await Transaction.findByIdAndUpdate(transaction._id, {
                status: 'failed',
                errorCode: 'SIGNATURE_MISMATCH',
                errorDescription: 'Payment signature verification failed',
            });

            // Update order status
            await Order.findByIdAndUpdate(transaction.order, {
                paymentStatus: 'failed',
            });

            return apiError('Payment verification failed', 400);
        }

        // Update transaction as successful
        await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'success',
            gatewayTransactionId: razorpay_payment_id,
            gatewayOrderId: razorpay_order_id,
            gatewaySignature: razorpay_signature,
            completedAt: new Date(),
        });

        // Update order status
        const order = await Order.findByIdAndUpdate(
            transaction.order,
            {
                paymentStatus: 'paid',
                status: 'completed',
                completedDate: new Date(),
            },
            { new: true }
        );

        // If subscription order, update user's plan
        if (order && order.type === 'subscription') {
            await User.findByIdAndUpdate(order.user, {
                plan: order.plan,
                planName: order.planName,
                planStartDate: order.subscriptionStartDate || new Date(),
                planEndDate: order.subscriptionEndDate || addMonths(new Date(), order.planDuration || 1),
                status: 'active',
            });
        }

        // Return success response for frontend
        return apiSuccess({
            transactionId: transaction.transactionId,
            orderId: order?.orderId,
            status: 'success',
            message: 'Payment successful',
            paymentId: razorpay_payment_id,
            amount: transaction.amount,
            planName: order?.planName,
            subscriptionEndDate: order?.subscriptionEndDate,
        }, 'Payment verified successfully');

    } catch (error) {
        console.error('Verify payment error:', error);
        return apiError('Payment verification failed', 500);
    }
}
