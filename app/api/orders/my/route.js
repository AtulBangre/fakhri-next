import { OrderController } from '@/controllers/orderController';

// GET /api/orders/my - Get current user's orders
export async function GET() {
    return await OrderController.getMyOrders();
}
