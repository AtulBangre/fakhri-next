import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireSuperAdmin } from '@/middleware/auth';

// GET /api/plans - Get all plans (Public)
export async function GET(request) {
    try {
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const activeOnly = searchParams.get('active') !== 'false';

        const query = activeOnly ? { isActive: true } : {};

        const plans = await Plan.find(query)
            .sort({ sortOrder: 1 })
            .lean();

        // Format plans for frontend
        const formattedPlans = plans.map(plan => ({
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
            cta: plan.cta || `Get ${plan.name} Plan`,
            sortOrder: plan.sortOrder,
            createdAt: plan.createdAt,
        }));

        return apiSuccess(formattedPlans);

    } catch (error) {
        console.error('Get plans error:', error);
        return apiError('Failed to fetch plans', 500);
    }
}

// POST /api/plans - Create new plan (Super Admin only)
export async function POST(request) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const body = await request.json();

        await dbConnect();

        // Check if planId already exists
        const existingPlan = await Plan.findOne({ planId: body.planId });
        if (existingPlan) {
            return apiError('Plan ID already exists', 409);
        }

        const plan = await Plan.create({
            planId: body.planId,
            name: body.name,
            subtitle: body.subtitle,
            price: body.price,
            currency: body.currency || '₹',
            period: body.period || '/month',
            description: body.description,
            highlighted: body.highlighted || false,
            isActive: body.isActive !== false,
            features: body.features || [],
            cta: body.cta,
            sortOrder: body.sortOrder || 99,
        });

        return apiSuccess({
            id: plan._id,
            planId: plan.planId,
            name: plan.name,
            price: plan.price,
        }, 'Plan created successfully', 201);

    } catch (error) {
        console.error('Create plan error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to create plan', 500);
    }
}
