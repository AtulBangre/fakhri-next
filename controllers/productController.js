/**
 * Product Controller
 * Handle HTTP requests for products and pricing
 */

import { ProductService } from '@/services/productService';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireSuperAdmin } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';

export const ProductController = {
    // ================== PRODUCTS ==================

    /**
     * Get all products (Public)
     */
    getAllProducts: asyncHandler(async (searchParams) => {
        const filters = {
            category: searchParams?.get('category'),
            type: searchParams?.get('type'),
            isWithin2Hours: searchParams?.get('within2hours') === 'true',
        };

        const result = await ProductService.getAllProducts(filters);
        return apiSuccess(result.products);
    }),

    /**
     * Get Within 2 Hours services (Public)
     */
    getWithin2HoursServices: asyncHandler(async () => {
        const services = await ProductService.getWithin2HoursServices();
        return apiSuccess(services);
    }),

    /**
     * Get product by ID
     */
    getProductById: asyncHandler(async (productId) => {
        const product = await ProductService.getProductById(productId);
        return apiSuccess(product);
    }),

    /**
     * Create product (Super Admin only)
     */
    createProduct: asyncHandler(async (body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const product = await ProductService.createProduct(body);
        return apiSuccess(product, 'Product created successfully', 201);
    }),

    /**
     * Update product (Super Admin only)
     */
    updateProduct: asyncHandler(async (productId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const product = await ProductService.updateProduct(productId, body);
        return apiSuccess(product, 'Product updated successfully');
    }),

    /**
     * Delete product (Super Admin only)
     */
    deleteProduct: asyncHandler(async (productId) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        await ProductService.deleteProduct(productId);
        return apiSuccess(null, 'Product deleted successfully');
    }),

    // ================== PLANS ==================

    /**
     * Get all plans (Public)
     */
    getAllPlans: asyncHandler(async () => {
        const plans = await ProductService.getAllPlans();
        return apiSuccess(plans);
    }),

    /**
     * Get plan by ID
     */
    getPlanById: asyncHandler(async (planId) => {
        const plan = await ProductService.getPlanById(planId);
        return apiSuccess(plan);
    }),

    /**
     * Get plan by plan ID string
     */
    getPlanByPlanId: asyncHandler(async (planIdString) => {
        const plan = await ProductService.getPlanByPlanId(planIdString);
        if (!plan) {
            return apiError('Plan not found', 404);
        }
        return apiSuccess(plan);
    }),

    /**
     * Create plan (Super Admin only)
     */
    createPlan: asyncHandler(async (body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const plan = await ProductService.createPlan(body);
        return apiSuccess(plan, 'Plan created successfully', 201);
    }),

    /**
     * Update plan (Super Admin only)
     */
    updatePlan: asyncHandler(async (planId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const plan = await ProductService.updatePlan(planId, body);
        return apiSuccess(plan, 'Plan updated successfully');
    }),

    /**
     * Delete plan (Super Admin only)
     */
    deletePlan: asyncHandler(async (planId) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        await ProductService.deletePlan(planId);
        return apiSuccess(null, 'Plan deleted successfully');
    }),

    // ================== PRICING DATA ==================

    /**
     * Get pricing data for frontend (Public)
     */
    getPricingData: asyncHandler(async () => {
        const data = await ProductService.getPricingData();
        return apiSuccess(data);
    }),
};

export default ProductController;
