/**
 * Product Service
 * Business logic for products and pricing
 */

import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Plan from '@/models/Plan';
import { createError } from '@/middleware/errorHandler';

export class ProductService {
    /**
     * Create a new product
     */
    static async createProduct(productData) {
        await dbConnect();

        const existingProduct = await Product.findOne({ productId: productData.productId });
        if (existingProduct) {
            throw createError.duplicate('Product ID');
        }

        return await Product.create(productData);
    }

    /**
     * Get product by ID
     */
    static async getProductById(productId) {
        await dbConnect();
        const product = await Product.findById(productId);
        if (!product) {
            throw createError.notFound('Product');
        }
        return product;
    }

    /**
     * Get product by product ID string
     */
    static async getProductByProductId(productIdString) {
        await dbConnect();
        return await Product.findOne({ productId: productIdString });
    }

    /**
     * Update product
     */
    static async updateProduct(productId, updateData) {
        await dbConnect();
        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!product) {
            throw createError.notFound('Product');
        }
        return product;
    }

    /**
     * Delete product
     */
    static async deleteProduct(productId) {
        await dbConnect();
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw createError.notFound('Product');
        }
        return { message: 'Product deleted successfully' };
    }

    /**
     * Get all products
     */
    static async getAllProducts(filters = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 50,
            category,
            type,
            isActive = true,
            isWithin2Hours,
        } = filters;

        const query = { isActive };

        if (category) query.category = category;
        if (type) query.type = type;
        if (typeof isWithin2Hours === 'boolean') query.isWithin2Hours = isWithin2Hours;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ sortOrder: 1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return { products, total };
    }

    /**
     * Get Within 2 Hours services
     */
    static async getWithin2HoursServices() {
        await dbConnect();
        return await Product.find({ isWithin2Hours: true, isActive: true })
            .sort({ sortOrder: 1 })
            .lean();
    }

    // ================== PLANS ==================

    /**
     * Get all plans
     */
    static async getAllPlans(includeInactive = false) {
        await dbConnect();
        const query = includeInactive ? {} : { isActive: true };
        return await Plan.find(query).sort({ sortOrder: 1 }).lean();
    }

    /**
     * Get plan by ID
     */
    static async getPlanById(planId) {
        await dbConnect();
        const plan = await Plan.findById(planId);
        if (!plan) {
            throw createError.notFound('Plan');
        }
        return plan;
    }

    /**
     * Get plan by plan ID string
     */
    static async getPlanByPlanId(planIdString) {
        await dbConnect();
        return await Plan.findOne({ planId: planIdString });
    }

    /**
     * Create plan
     */
    static async createPlan(planData) {
        await dbConnect();

        const existingPlan = await Plan.findOne({ planId: planData.planId });
        if (existingPlan) {
            throw createError.duplicate('Plan ID');
        }

        return await Plan.create(planData);
    }

    /**
     * Update plan
     */
    static async updatePlan(planId, updateData) {
        await dbConnect();
        const plan = await Plan.findByIdAndUpdate(
            planId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!plan) {
            throw createError.notFound('Plan');
        }
        return plan;
    }

    /**
     * Delete plan
     */
    static async deletePlan(planId) {
        await dbConnect();
        const plan = await Plan.findByIdAndDelete(planId);
        if (!plan) {
            throw createError.notFound('Plan');
        }
        return { message: 'Plan deleted successfully' };
    }

    /**
     * Get pricing for frontend
     */
    static async getPricingData() {
        await dbConnect();

        const [plans, within2HoursServices] = await Promise.all([
            Plan.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
            Product.find({ isWithin2Hours: true, isActive: true }).sort({ sortOrder: 1 }).lean(),
        ]);

        // Format plans for frontend
        const formattedPlans = plans.map((plan) => ({
            id: plan.planId,
            name: plan.name,
            subtitle: plan.subtitle,
            prices: {
                monthly: `${plan.currency}${plan.price.toLocaleString()}`,
            },
            period: plan.period,
            description: plan.description,
            highlighted: plan.highlighted,
            features: plan.features,
            cta: plan.cta,
        }));

        return {
            plans: formattedPlans,
            within2HoursServices,
        };
    }
}

export default ProductService;
