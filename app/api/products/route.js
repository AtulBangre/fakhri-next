import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireSuperAdmin } from '@/middleware/auth';

// GET /api/products - Get all products
export async function GET(request) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const isWithin2Hours = searchParams.get('within2hours') === 'true';
        const activeOnly = searchParams.get('active') !== 'false';

        const query = {};
        if (activeOnly) query.isActive = true;
        if (category) query.category = category;
        if (type) query.type = type;
        if (isWithin2Hours) query.isWithin2Hours = true;

        const products = await Product.find(query)
            .sort({ sortOrder: 1, name: 1 })
            .lean();

        // Format products for frontend
        const formattedProducts = products.map(product => ({
            id: product._id,
            productId: product.productId,
            name: product.name,
            description: product.description,
            price: product.price,
            currency: '₹',
            category: product.category,
            type: product.type,
            isWithin2Hours: product.isWithin2Hours,
            isActive: product.isActive,
            features: product.features,
            image: product.image,
        }));

        return apiSuccess(formattedProducts);

    } catch (error) {
        console.error('Get products error:', error);
        return apiError('Failed to fetch products', 500);
    }
}

// POST /api/products - Create new product (Super Admin only)
export async function POST(request) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const body = await request.json();

        await dbConnect();

        // Check if productId already exists
        if (body.productId) {
            const existingProduct = await Product.findOne({ productId: body.productId });
            if (existingProduct) {
                return apiError('Product ID already exists', 409);
            }
        }

        const product = await Product.create({
            productId: body.productId || `prod-${Date.now()}`,
            name: body.name,
            description: body.description,
            price: body.price,
            category: body.category,
            type: body.type || 'one-time',
            isWithin2Hours: body.isWithin2Hours || false,
            isActive: body.isActive !== false,
            features: body.features || [],
            image: body.image,
        });

        return apiSuccess({
            id: product._id,
            productId: product.productId,
            name: product.name,
            price: product.price,
        }, 'Product created successfully', 201);

    } catch (error) {
        console.error('Create product error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to create product', 500);
    }
}
