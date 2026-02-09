import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';

// GET /api/tasks/[id] - Get task by ID
export async function GET(request, { params }) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { id } = await params;

        await dbConnect();

        const task = await Task.findById(id)
            .populate('client', 'name email company planName')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name')
            .lean();

        if (!task) {
            return apiError('Task not found', 404);
        }

        // Clients can only view their own tasks
        if (auth.user.role === 'client' && task.client?._id.toString() !== auth.user.id) {
            return apiError('Forbidden', 403);
        }

        // Format response
        const taskResponse = {
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            client: task.client ? {
                id: task.client._id,
                name: task.client.name,
                email: task.client.email,
                company: task.client.company,
                planName: task.client.planName,
            } : null,
            clientName: task.clientName,
            assignedTo: task.assignedTo ? {
                id: task.assignedTo._id,
                name: task.assignedTo.name,
                email: task.assignedTo.email,
            } : null,
            assignedToName: task.assignedToName,
            createdBy: task.createdBy?.name,
            service: task.service,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            eta: task.eta,
            planForWeek: task.planForWeek,
            isHighPriority: task.isHighPriority,
            isCompleted: task.isCompleted,
            progressPercentage: task.progressPercentage,
            lastUpdated: task.lastUpdated,
            completedDate: task.completedDate,
            notes: task.notes,
            attachments: task.attachments,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };

        return apiSuccess(taskResponse);

    } catch (error) {
        console.error('Get task error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid task ID', 400);
        }

        return apiError('Failed to fetch task', 500);
    }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, { params }) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const { id } = await params;
        const body = await request.json();

        await dbConnect();

        const existingTask = await Task.findById(id);

        if (!existingTask) {
            return apiError('Task not found', 404);
        }

        // Build update data
        const updateData = {};
        const allowedFields = [
            'title', 'description', 'service', 'priority', 'status',
            'dueDate', 'eta', 'planForWeek', 'isHighPriority',
            'progressPercentage', 'notes', 'lastUpdated'
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        // Handle assignment change (Super Admin only)
        if (body.assignedTo && auth.user.role === 'super-admin') {
            updateData.assignedTo = body.assignedTo;
            updateData.assignedToName = body.assignedToName;
        }

        // Handle status changes
        if (body.status === 'completed' && existingTask.status !== 'completed') {
            updateData.isCompleted = true;
            updateData.completedDate = new Date();
            updateData.progressPercentage = 100;

            // Update client's active tasks count
            if (existingTask.client) {
                await User.findByIdAndUpdate(existingTask.client, {
                    $inc: { activeTasks: -1 },
                });
            }
        }

        // If reactivating a completed task
        if (body.status && body.status !== 'completed' && existingTask.status === 'completed') {
            updateData.isCompleted = false;
            updateData.completedDate = null;

            // Update client's active tasks count
            if (existingTask.client) {
                await User.findByIdAndUpdate(existingTask.client, {
                    $inc: { activeTasks: 1 },
                });
            }
        }

        // Update lastUpdated timestamp
        updateData.lastUpdated = 'Just now';

        const task = await Task.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name');

        // Format response
        const taskResponse = {
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            status: task.status,
            priority: task.priority,
            progressPercentage: task.progressPercentage,
            assignedToName: task.assignedToName,
            isCompleted: task.isCompleted,
        };

        return apiSuccess(taskResponse, 'Task updated successfully');

    } catch (error) {
        console.error('Update task error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid task ID', 400);
        }

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to update task', 500);
    }
}

// DELETE /api/tasks/[id] - Delete task (Super Admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        await dbConnect();

        const task = await Task.findById(id);

        if (!task) {
            return apiError('Task not found', 404);
        }

        // Update client's active tasks count if task was not completed
        if (task.client && !task.isCompleted) {
            await User.findByIdAndUpdate(task.client, {
                $inc: { activeTasks: -1 },
            });
        }

        await Task.findByIdAndDelete(id);

        return apiSuccess(null, 'Task deleted successfully');

    } catch (error) {
        console.error('Delete task error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid task ID', 400);
        }

        return apiError('Failed to delete task', 500);
    }
}
