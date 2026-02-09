/**
 * User Controller
 * Handle HTTP requests for user operations
 */

import { UserService } from '@/services/userService';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

export const UserController = {
    /**
     * Get current user profile
     */
    getProfile: asyncHandler(async () => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const user = await UserService.getById(auth.user.id);
        return apiSuccess(user, 'Profile retrieved successfully');
    }),

    /**
     * Update current user profile
     */
    updateProfile: asyncHandler(async (body) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const validation = validateBody(body, schemas.updateUser);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        const user = await UserService.update(auth.user.id, validation.data);
        return apiSuccess(user, 'Profile updated successfully');
    }),

    /**
     * Get all users (Super Admin only)
     */
    getAll: asyncHandler(async (searchParams) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            role: searchParams.get('role'),
            status: searchParams.get('status'),
            search: searchParams.get('search'),
        };

        const result = await UserService.getAll(filters);
        return apiPaginated(
            result.users,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    }),

    /**
     * Get user by ID
     */
    getById: asyncHandler(async (userId) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        // Users can only access their own data unless they are admin/super-admin
        if (auth.user.id !== userId && !['admin', 'super-admin'].includes(auth.user.role)) {
            return apiError('Forbidden', 403);
        }

        const user = await UserService.getById(userId);
        return apiSuccess(user);
    }),

    /**
     * Create user (Super Admin only)
     */
    create: asyncHandler(async (body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const validation = validateBody(body, schemas.register);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        const user = await UserService.create(validation.data);
        return apiSuccess(user, 'User created successfully', 201);
    }),

    /**
     * Update user (Super Admin only)
     */
    update: asyncHandler(async (userId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const user = await UserService.update(userId, body);
        return apiSuccess(user, 'User updated successfully');
    }),

    /**
     * Delete user (Super Admin only)
     */
    delete: asyncHandler(async (userId) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        await UserService.delete(userId);
        return apiSuccess(null, 'User deleted successfully');
    }),

    /**
     * Get clients by manager (Admin only)
     */
    getClientsByManager: asyncHandler(async () => {
        const auth = await requireRole('admin');
        if (!auth.authorized) return auth.error;

        const clients = await UserService.getClientsByManager(auth.user.id);
        return apiSuccess(clients);
    }),

    /**
     * Get unassigned clients (Super Admin only)
     */
    getUnassignedClients: asyncHandler(async () => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const clients = await UserService.getUnassignedClients();
        return apiSuccess(clients);
    }),

    /**
     * Assign client to manager (Super Admin only)
     */
    assignToManager: asyncHandler(async (body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { clientId, managerId, managerName } = body;
        const client = await UserService.assignToManager(clientId, managerId, managerName);
        return apiSuccess(client, 'Client assigned successfully');
    }),

    /**
     * Update user status (Super Admin only)
     */
    updateStatus: asyncHandler(async (userId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const user = await UserService.updateStatus(userId, body.status);
        return apiSuccess(user, 'User status updated successfully');
    }),

    /**
     * Get dashboard stats
     */
    getDashboardStats: asyncHandler(async () => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const stats = await UserService.getDashboardStats();
        return apiSuccess(stats);
    }),
};

export default UserController;
