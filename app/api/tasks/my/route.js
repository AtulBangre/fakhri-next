import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth } from '@/middleware/auth';

// GET /api/tasks/my - Get current user's tasks
export async function GET(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        await dbConnect();

        const query = {};

        // Role-based filtering
        if (auth.user.role === 'client') {
            query.client = auth.user.id;
        } else if (auth.user.role === 'admin') {
            query.assignedTo = auth.user.id;
        }

        // Apply status filter
        if (status) query.status = status;

        const tasks = await Task.find(query)
            .populate('client', 'name company')
            .sort({ isHighPriority: -1, dueDate: 1 })
            .limit(limit)
            .lean();

        // Format tasks for frontend
        const formattedTasks = tasks.map(task => ({
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            client: task.client ? {
                name: task.client.name,
                company: task.client.company,
            } : null,
            clientName: task.clientName,
            assignedToName: task.assignedToName,
            service: task.service,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            eta: task.eta,
            isHighPriority: task.isHighPriority,
            progressPercentage: task.progressPercentage,
            lastUpdated: task.lastUpdated,
        }));

        // Calculate stats
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            highPriority: tasks.filter(t => t.isHighPriority).length,
        };

        return apiSuccess({
            tasks: formattedTasks,
            stats,
        });

    } catch (error) {
        console.error('Get my tasks error:', error);
        return apiError('Failed to fetch tasks', 500);
    }
}
