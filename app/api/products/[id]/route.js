import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireSuperAdmin } from '@/middleware/auth';

// GET /api/products/[id] - Get product by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        await dbConnect();

        // Try to find by MongoDB ID or productId
        let product = await Product.findById(id).lean().catch(() => null);

        if (!product) {
            product = await Product.findOne({ productId: id }).lean();
        }

        if (!product) {
            return apiError('Product not found', 404);
        }

        // Format response
        const productResponse = {
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
        };

        return apiSuccess(productResponse);

    } catch (error) {
        console.error('Get product error:', error);
        return apiError('Failed to fetch product', 500);
    }
}

// PUT /api/products/[id] - Update product (Super Admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();

        await dbConnect();

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return apiError('Product not found', 404);
        }

        return apiSuccess({
            id: product._id,
            productId: product.productId,
            name: product.name,
            price: product.price,
        }, 'Product updated successfully');

    } catch (error) {
        console.error('Update product error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid product ID', 400);
        }

        return apiError('Failed to update product', 500);
    }
}

// DELETE /api/products/[id] - Delete product (Super Admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        await dbConnect();

        // Soft delete by deactivating
        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return apiError('Product not found', 404);
        }

        return apiSuccess(null, 'Product deactivated successfully');

    } catch (error) {
        console.error('Delete product error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid product ID', 400);
        }

        return apiError('Failed to delete product', 500);
    }
}
