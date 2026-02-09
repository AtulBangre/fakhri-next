import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { razorpay } from '@/lib/razorpay';
import Order from '@/models/Order';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import shortid from 'shortid';

export async function POST(req) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, amount, currency = 'INR', planParams } = await req.json();

        // Calculate amount in smallest currency unit (paise for INR)
        // Ensure amount is a number
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const options = {
            amount: Math.round(numericAmount * 100), // amount in the smallest currency unit
            currency,
            receipt: shortid.generate(),
            payment_capture: 1, // Auto capture
        };

        // Create order in Razorpay
        const razorpayOrder = await razorpay.orders.create(options);

        // Create order in Database (Status: Pending)
        // We need to fetch User details to get address or use defaults if not available
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Construct billing address from user details or placeholders
        const billingAddress = {
            name: user.name,
            email: user.email,
            // Add other fields if available in user model or request
        };

        const newOrder = new Order({
            orderId: razorpayOrder.receipt, // Use receipt as internal order ID/ or generate one
            user: user._id,
            type: 'subscription', // or based on plan params
            planName: planParams?.name || 'Unknown Plan',
            planDuration: 1, // Default or from params
            subtotal: numericAmount,
            total: numericAmount,
            currency: currency,
            status: 'pending', // Initial status
            paymentStatus: 'pending',
            billingAddress,
            // Store razorpay order id in notes or a specific field if schema supports,
            // Schema has gatewayOrderId in Transaction, but ideally Order also links it.
            // We can put it in notes for now or relying on Transaction linkage.
            notes: `Razorpay Order ID: ${razorpayOrder.id}`,
        });

        await newOrder.save();

        return NextResponse.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            orderId: newOrder.orderId, // Internal Order ID
            key: process.env.RAZORPAY_KEY_ID // Send key to frontend
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
