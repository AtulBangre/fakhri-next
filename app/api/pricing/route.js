import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/utils/apiResponse';

// GET /api/pricing - Get all pricing data (Public)
export async function GET() {
    try {
        await dbConnect();

        // Get all active plans
        const plans = await Plan.find({ isActive: true })
            .sort({ sortOrder: 1 })
            .lean();

        // Get Within 2 Hours services
        const within2HoursServices = await Product.find({
            isWithin2Hours: true,
            isActive: true
        }).lean();

        // Format plans for frontend (matching expected structure)
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
            features: plan.features || [],
            cta: plan.cta || `Get ${plan.name} Plan`,
            sortOrder: plan.sortOrder,
        }));

        // Format services for frontend
        const formattedServices = within2HoursServices.map(service => ({
            id: service._id,
            productId: service.productId,
            name: service.name,
            price: service.price,
            currency: '₹',
            category: service.category,
            description: service.description,
        }));

        // Response structure matching frontend expectations
        const pricingData = {
            plans: formattedPlans,
            within2HoursServices: formattedServices,
            // Additional metadata
            meta: {
                taxRate: 18, // 18% GST
                currency: 'INR',
                currencySymbol: '₹',
            },
        };

        return apiSuccess(pricingData);

    } catch (error) {
        console.error('Get pricing error:', error);
        return apiError('Failed to fetch pricing data', 500);
    }
}
