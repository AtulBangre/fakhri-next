import { OrderController } from '@/controllers/orderController';

// GET /api/orders - Get all orders
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await OrderController.getAll(searchParams);
}

// POST /api/orders - Create new order
export async function POST(request) {
    const body = await request.json();
    return await OrderController.create(body);
}
