/**
 * Order Controller
 * Handle HTTP requests for order operations
 */

import { OrderService } from '@/services/orderService';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

export const OrderController = {
    /**
     * Create new order
     */
    create: asyncHandler(async (body) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const validation = validateBody(body, schemas.createOrder);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        const orderData = {
            ...validation.data,
            user: auth.user.id,
            type: body.type || 'subscription',
            billingAddress: {
                name: body.billingName,
                email: body.billingEmail,
                phone: body.billingPhone,
                address: body.billingAddress,
                city: body.billingCity,
                state: body.billingState,
                pincode: body.billingPincode,
                gstin: body.gstin,
            },
        };

        const order = await OrderService.create(orderData);
        return apiSuccess(order, 'Order created successfully', 201);
    }),

    /**
     * Get order by ID
     */
    getById: asyncHandler(async (orderId) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const order = await OrderService.getById(orderId);

        // Clients can only view their own orders
        if (auth.user.role === 'client' && order.user._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        return apiSuccess(order);
    }),

    /**
     * Get all orders
     */
    getAll: asyncHandler(async (searchParams) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            status: searchParams.get('status'),
            paymentStatus: searchParams.get('paymentStatus'),
            type: searchParams.get('type'),
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
        };

        const result = await OrderService.getAll(filters);
        return apiPaginated(
            result.orders,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    }),

    /**
     * Get user's orders
     */
    getMyOrders: asyncHandler(async () => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const orders = await OrderService.getByUser(auth.user.id);
        return apiSuccess(orders);
    }),

    /**
     * Update order status
     */
    updateStatus: asyncHandler(async (orderId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const order = await OrderService.updateStatus(orderId, body.status, body.paymentStatus);
        return apiSuccess(order, 'Order status updated');
    }),

    /**
     * Create subscription order
     */
    createSubscription: asyncHandler(async (body) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { planId, duration, billingAddress } = body;

        const order = await OrderService.createSubscription(
            auth.user.id,
            planId,
            billingAddress,
            duration
        );

        return apiSuccess(order, 'Subscription order created', 201);
    }),

    /**
     * Get order statistics
     */
    getStats: asyncHandler(async (searchParams) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const dateRange = searchParams.get('range') || 'month';
        const stats = await OrderService.getStats(dateRange);
        return apiSuccess(stats);
    }),
};

export default OrderController;
