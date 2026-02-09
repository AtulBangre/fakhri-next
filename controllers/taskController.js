/**
 * Task Controller
 * Handle HTTP requests for task operations
 */

import { TaskService } from '@/services/taskService';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

export const TaskController = {
    /**
     * Create new task
     */
    create: asyncHandler(async (body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const validation = validateBody(body, schemas.createTask);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        const taskData = {
            ...validation.data,
            client: body.clientId,
            assignedTo: body.assignedTo || auth.user.id,
            createdBy: auth.user.id,
        };

        const task = await TaskService.create(taskData);
        return apiSuccess(task, 'Task created successfully', 201);
    }),

    /**
     * Get task by ID
     */
    getById: asyncHandler(async (taskId) => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const task = await TaskService.getById(taskId);

        // Clients can only view their own tasks
        if (auth.user.role === 'client' && task.client._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        return apiSuccess(task);
    }),

    /**
     * Update task
     */
    update: asyncHandler(async (taskId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const task = await TaskService.update(taskId, body);
        return apiSuccess(task, 'Task updated successfully');
    }),

    /**
     * Delete task
     */
    delete: asyncHandler(async (taskId) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        await TaskService.delete(taskId);
        return apiSuccess(null, 'Task deleted successfully');
    }),

    /**
     * Get all tasks
     */
    getAll: asyncHandler(async (searchParams) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            status: searchParams.get('status'),
            priority: searchParams.get('priority'),
            service: searchParams.get('service'),
            isHighPriority: searchParams.get('highPriority') === 'true',
        };

        // Admins only see their assigned tasks
        if (auth.user.role === 'admin') {
            filters.assignedTo = auth.user.id;
        }

        const result = await TaskService.getAll(filters);
        return apiPaginated(
            result.tasks,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    }),

    /**
     * Get my tasks (Client or Admin)
     */
    getMyTasks: asyncHandler(async () => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        let tasks;
        if (auth.user.role === 'client') {
            tasks = await TaskService.getByClient(auth.user.id);
        } else {
            tasks = await TaskService.getByAssignee(auth.user.id);
        }

        return apiSuccess(tasks);
    }),

    /**
     * Get tasks by client
     */
    getByClient: asyncHandler(async (clientId) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const tasks = await TaskService.getByClient(clientId);
        return apiSuccess(tasks);
    }),

    /**
     * Update task status
     */
    updateStatus: asyncHandler(async (taskId, body) => {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const task = await TaskService.updateStatus(taskId, body.status);
        return apiSuccess(task, 'Task status updated');
    }),

    /**
     * Assign task
     */
    assign: asyncHandler(async (taskId, body) => {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { assigneeId, assigneeName } = body;
        const task = await TaskService.assign(taskId, assigneeId, assigneeName);
        return apiSuccess(task, 'Task assigned successfully');
    }),

    /**
     * Get task statistics
     */
    getStats: asyncHandler(async () => {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const stats = await TaskService.getStats(auth.user.id, auth.user.role);
        return apiSuccess(stats);
    }),
};

export default TaskController;
