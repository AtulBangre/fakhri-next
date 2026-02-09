import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireSuperAdmin } from '@/middleware/auth';

// GET /api/plans/[id] - Get plan by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        await dbConnect();

        // Try to find by MongoDB ID or planId
        let plan = await Plan.findById(id).lean().catch(() => null);

        if (!plan) {
            plan = await Plan.findOne({ planId: id }).lean();
        }

        if (!plan) {
            return apiError('Plan not found', 404);
        }

        // Format response
        const planResponse = {
            id: plan._id,
            planId: plan.planId,
            name: plan.name,
            subtitle: plan.subtitle,
            price: plan.price,
            currency: plan.currency || '₹',
            period: plan.period || '/month',
            description: plan.description,
            highlighted: plan.highlighted || false,
            isActive: plan.isActive,
            features: plan.features || [],
            cta: plan.cta,
            sortOrder: plan.sortOrder,
        };

        return apiSuccess(planResponse);

    } catch (error) {
        console.error('Get plan error:', error);
        return apiError('Failed to fetch plan', 500);
    }
}

// PUT /api/plans/[id] - Update plan (Super Admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();

        await dbConnect();

        const plan = await Plan.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!plan) {
            return apiError('Plan not found', 404);
        }

        return apiSuccess({
            id: plan._id,
            planId: plan.planId,
            name: plan.name,
            price: plan.price,
            isActive: plan.isActive,
        }, 'Plan updated successfully');

    } catch (error) {
        console.error('Update plan error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid plan ID', 400);
        }

        return apiError('Failed to update plan', 500);
    }
}

// DELETE /api/plans/[id] - Delete plan (Super Admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        await dbConnect();

        // Instead of deleting, deactivate the plan
        const plan = await Plan.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!plan) {
            return apiError('Plan not found', 404);
        }

        return apiSuccess(null, 'Plan deactivated successfully');

    } catch (error) {
        console.error('Delete plan error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid plan ID', 400);
        }

        return apiError('Failed to delete plan', 500);
    }
}
