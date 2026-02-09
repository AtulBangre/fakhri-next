import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';
import shortid from 'shortid';

export async function POST(req) {
    try {
        await dbConnect();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Internal Order ID passed from frontend
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // 2. Fetch Order
        // If orderId is provided, use it. Otherwise try to find by razorpay_order_id in notes (fallback)
        let order;
        if (orderId) {
            order = await Order.findOne({ orderId: orderId });
        } else {
            // Fallback: search in notes (not ideal but works if stuck)
            // This is risky if multiple orders have same text, effectively unlikely with ID
            order = await Order.findOne({ notes: { $regex: razorpay_order_id } });
        }

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 3. Update Order Status
        if (order.status !== 'completed') {
            order.status = 'processing'; // Or 'completed' directly if instant
            order.paymentStatus = 'paid';
            order.completedDate = new Date();
            // Store razorpay details in metadata or notes if needed
            order.notes = (order.notes || '') + `\nPayment Verified. ID: ${razorpay_payment_id}`;
            await order.save();
        }

        // 4. Create Transaction Record
        // Check if transaction already exists to avoid duplicates
        const existingTx = await Transaction.findOne({ gatewayTransactionId: razorpay_payment_id });

        if (!existingTx) {
            const newTransaction = new Transaction({
                transactionId: `txn_${shortid.generate()}`,
                order: order._id,
                user: order.user,
                paymentGateway: 'razorpay',
                gatewayTransactionId: razorpay_payment_id,
                gatewayOrderId: razorpay_order_id,
                gatewaySignature: razorpay_signature,
                amount: order.total,
                currency: order.currency,
                status: 'success',
                paymentMethod: 'other', // We can't know detailed method without fetching payment details from Razorpay API, keeping generic or 'card'
                initiatedAt: new Date(),
                completedAt: new Date(),
                notes: 'Payment verified successfully via API'
            });
            await newTransaction.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order updated'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
