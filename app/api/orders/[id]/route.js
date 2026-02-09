import { OrderController } from '@/controllers/orderController';

// GET /api/orders/[id] - Get order by ID
export async function GET(request, { params }) {
    const { id } = await params;
    return await OrderController.getById(id);
}

// PUT /api/orders/[id] - Update order status
export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    return await OrderController.updateStatus(id, body);
}
