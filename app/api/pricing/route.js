import { ProductController } from '@/controllers/productController';

// GET /api/pricing - Get pricing data for frontend (Public)
export async function GET() {
    return await ProductController.getPricingData();
}
