/**
 * Transaction Controller
 * Handle HTTP requests for transaction operations
 */

import { TransactionService } from '@/services/transactionService';
import { OrderService } from '@/services/orderService';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';

export const TransactionController = {
    /**
     * Initialize payment
     */
    initializePayment: asyncHandler(async (body) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { orderId } = body;
        const order = await OrderService.getById(orderId);

        // Verify order belongs to user
        if (order.user._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        // Create transaction record
        const transaction = await TransactionService.create({
            order: orderId,
            user: auth.user.id,
            amount: order.total,
            paymentGateway: 'razorpay',
            status: 'initiated',
        });

        // Here you would typically create a Razorpay order
        // For now, returning transaction details
        return apiSuccess({
            transactionId: transaction.transactionId,
            orderId: order.orderId,
            amount: order.total,
            currency: 'INR',
            // razorpayOrderId would be added here after Razorpay integration
        }, 'Payment initialized');
    }),

    /**
     * Verify payment (Razorpay callback)
     */
    verifyPayment: asyncHandler(async (body) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const {
            transactionId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = body;

        // Verify signature
        const isValid = await TransactionService.verifyRazorpayPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            await TransactionService.updateStatus(transactionId, 'failed', {
                errorCode: 'SIGNATURE_MISMATCH',
                errorDescription: 'Payment signature verification failed',
            });
            return apiError('Payment verification failed', 400);
        }

        // Update transaction as successful
        const transaction = await TransactionService.updateStatus(transactionId, 'success', {
            gatewayTransactionId: razorpay_payment_id,
            gatewayOrderId: razorpay_order_id,
            gatewaySignature: razorpay_signature,
        });

        return apiSuccess(transaction, 'Payment verified successfully');
    }),

    /**
     * Get transaction by ID
     */
    getById: asyncHandler(async (transactionId) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const transaction = await TransactionService.getById(transactionId);

        // Clients can only view their own transactions
        if (auth.user.role === 'client' && transaction.user._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        return apiSuccess(transaction);
    }),

    /**
     * Get all transactions
     */
    getAll: asyncHandler(async (searchParams) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            status: searchParams.get('status'),
            paymentGateway: searchParams.get('gateway'),
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
        };

        const result = await TransactionService.getAll(filters);
        return apiPaginated(
            result.transactions,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    }),

    /**
     * Get user's transactions
     */
    getMyTransactions: asyncHandler(async () => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const transactions = await TransactionService.getByUser(auth.user.id);
        return apiSuccess(transactions);
    }),

    /**
     * Process refund
     */
    processRefund: asyncHandler(async (transactionId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { amount, reason } = body;

        const transaction = await TransactionService.processRefund(
            transactionId,
            amount,
            reason
        );

        return apiSuccess(transaction, 'Refund processed successfully');
    }),

    /**
     * Get transaction statistics
     */
    getStats: asyncHandler(async (searchParams) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const dateRange = searchParams.get('range') || 'month';
        const stats = await TransactionService.getStats(dateRange);
        return apiSuccess(stats);
    }),
};

export default TransactionController;
