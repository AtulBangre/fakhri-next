import { ProductController } from '@/controllers/productController';

// GET /api/products - Get all products
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await ProductController.getAllProducts(searchParams);
}

// POST /api/products - Create new product
export async function POST(request) {
    const body = await request.json();
    return await ProductController.createProduct(body);
}
