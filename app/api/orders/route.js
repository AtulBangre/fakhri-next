import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Plan from '@/models/Plan';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole } from '@/middleware/auth';

// Helper to add months to date
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// Helper to generate order ID
const generateOrderId = async () => {
    const count = await Order.countDocuments();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ORD-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
};

// GET /api/orders - Get all orders with filtering
export async function GET(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const type = searchParams.get('type');
        const userId = searchParams.get('userId');

        await dbConnect();

        const query = {};

        // Role-based filtering
        if (auth.user.role === 'client') {
            query.user = auth.user.id;
        } else if (userId) {
            query.user = userId;
        }

        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (type) query.type = type;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email company')
                .populate('plan', 'name price')
                .sort({ orderDate: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        // Format orders for frontend
        const formattedOrders = orders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            user: order.user ? {
                id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                company: order.user.company,
            } : null,
            type: order.type,
            planName: order.planName,
            planDuration: order.planDuration,
            subtotal: order.subtotal,
            discount: order.discount,
            tax: order.tax,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            orderDate: order.orderDate,
            completedDate: order.completedDate,
            subscriptionStartDate: order.subscriptionStartDate,
            subscriptionEndDate: order.subscriptionEndDate,
            billingAddress: order.billingAddress,
        }));

        return NextResponse.json({
            success: true,
            data: formattedOrders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Get orders error:', error);
        return apiError('Failed to fetch orders', 500);
    }
}

// POST /api/orders - Create new order
export async function POST(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const body = await request.json();
        const {
            planId,
            duration = 1, // months
            billingName,
            billingEmail,
            billingPhone,
            billingAddress,
            billingCity,
            billingState,
            billingPincode,
            billingCountry = 'India',
            gstin,
            type = 'subscription',
            items, // for add-on orders
        } = body;

        await dbConnect();

        let subtotal = 0;
        let planDetails = null;
        let orderItems = [];

        // For subscription orders
        if (type === 'subscription' && planId) {
            planDetails = await Plan.findOne({ planId });
            if (!planDetails) {
                return apiError('Plan not found', 404);
            }
            subtotal = planDetails.price * duration;
            orderItems.push({
                product: planDetails._id,
                productName: planDetails.name,
                quantity: duration,
                unitPrice: planDetails.price,
                totalPrice: subtotal,
            });
        }

        // For add-on/one-time orders
        if (type === 'one-time' && items && items.length > 0) {
            subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            orderItems = items.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
            }));
        }

        // Calculate tax (18% GST)
        const taxRate = 18;
        const tax = Math.round((subtotal * taxRate) / 100);
        const total = subtotal + tax;

        // Generate order ID
        const orderId = await generateOrderId();

        // Calculate subscription dates
        const subscriptionStartDate = new Date();
        const subscriptionEndDate = type === 'subscription'
            ? addMonths(subscriptionStartDate, duration)
            : null;

        // Create order
        const order = await Order.create({
            orderId,
            user: auth.user.id,
            type,
            plan: planDetails?._id,
            planName: planDetails?.name,
            planDuration: duration,
            items: orderItems,
            subtotal,
            discount: 0,
            tax,
            taxRate,
            total,
            status: 'pending',
            paymentStatus: 'pending',
            orderDate: new Date(),
            subscriptionStartDate,
            subscriptionEndDate,
            billingAddress: {
                name: billingName,
                email: billingEmail,
                phone: billingPhone,
                address: billingAddress,
                city: billingCity,
                state: billingState,
                pincode: billingPincode,
                country: billingCountry,
                gstin,
            },
        });

        // Format response for frontend (matches expected structure)
        const orderResponse = {
            id: order._id,
            orderId: order.orderId,
            type: order.type,
            planName: order.planName,
            planDuration: order.planDuration,
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            orderDate: order.orderDate,
            subscriptionStartDate: order.subscriptionStartDate,
            subscriptionEndDate: order.subscriptionEndDate,
        };

        return apiSuccess(orderResponse, 'Order created successfully', 201);

    } catch (error) {
        console.error('Create order error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to create order', 500);
    }
}
