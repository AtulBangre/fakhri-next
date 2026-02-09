import { ProductController } from '@/controllers/productController';

// GET /api/plans - Get all plans (Public)
export async function GET() {
    return await ProductController.getAllPlans();
}

// POST /api/plans - Create new plan
export async function POST(request) {
    const body = await request.json();
    return await ProductController.createPlan(body);
}
