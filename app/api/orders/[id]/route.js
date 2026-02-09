import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole } from '@/middleware/auth';

// Helper to add months to date
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// GET /api/orders/[id] - Get order by ID
export async function GET(request, { params }) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { id } = await params;

        await dbConnect();

        const order = await Order.findById(id)
            .populate('user', 'name email company')
            .populate('plan', 'name price period features')
            .lean();

        if (!order) {
            return apiError('Order not found', 404);
        }

        // Clients can only view their own orders
        if (auth.user.role === 'client' && order.user._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        // Format response
        const orderResponse = {
            id: order._id,
            orderId: order.orderId,
            user: order.user ? {
                id: order.user._id,
                name: order.user.name,
                email: order.user.email,
                company: order.user.company,
            } : null,
            type: order.type,
            plan: order.plan,
            planName: order.planName,
            planDuration: order.planDuration,
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            tax: order.tax,
            taxRate: order.taxRate,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            orderDate: order.orderDate,
            completedDate: order.completedDate,
            subscriptionStartDate: order.subscriptionStartDate,
            subscriptionEndDate: order.subscriptionEndDate,
            billingAddress: order.billingAddress,
            notes: order.notes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };

        return apiSuccess(orderResponse);

    } catch (error) {
        console.error('Get order error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid order ID', 400);
        }

        return apiError('Failed to fetch order', 500);
    }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(request, { params }) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();
        const { status, paymentStatus, notes } = body;

        await dbConnect();

        const order = await Order.findById(id);

        if (!order) {
            return apiError('Order not found', 404);
        }

        const updateData = {};

        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (notes) updateData.notes = notes;

        // Handle order completion
        if (status === 'completed' && order.status !== 'completed') {
            updateData.completedDate = new Date();

            // If subscription order, update user's plan
            if (order.type === 'subscription') {
                await User.findByIdAndUpdate(order.user, {
                    plan: order.plan,
                    planName: order.planName,
                    planStartDate: order.subscriptionStartDate || new Date(),
                    planEndDate: order.subscriptionEndDate || addMonths(new Date(), order.planDuration || 1),
                    status: 'active',
                });
            }
        }

        // Handle order cancellation
        if (status === 'cancelled') {
            updateData.cancelledDate = new Date();
            updateData.cancelledBy = auth.user.id;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('user', 'name email');

        return apiSuccess({
            id: updatedOrder._id,
            orderId: updatedOrder.orderId,
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
            completedDate: updatedOrder.completedDate,
        }, 'Order updated successfully');

    } catch (error) {
        console.error('Update order error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid order ID', 400);
        }

        return apiError('Failed to update order', 500);
    }
}

// DELETE /api/orders/[id] - Cancel/delete order (Super Admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireRole('super-admin');
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        await dbConnect();

        const order = await Order.findById(id);

        if (!order) {
            return apiError('Order not found', 404);
        }

        // Don't delete completed orders, just cancel them
        if (order.status === 'completed') {
            await Order.findByIdAndUpdate(id, {
                status: 'cancelled',
                cancelledDate: new Date(),
                cancelledBy: auth.user.id,
            });
            return apiSuccess(null, 'Order cancelled successfully');
        }

        await Order.findByIdAndDelete(id);

        return apiSuccess(null, 'Order deleted successfully');

    } catch (error) {
        console.error('Delete order error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid order ID', 400);
        }

        return apiError('Failed to delete order', 500);
    }
}
