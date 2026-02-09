/**
 * Task Service
 * Business logic for task management
 */

import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { generateId } from '@/utils/generators';

export class TaskService {
    /**
     * Create a new task
     */
    static async create(taskData) {
        await dbConnect();

        const count = await Task.countDocuments();
        const taskId = generateId('TSK', count + 1);

        // Get client name if clientId provided
        let clientName = taskData.clientName;
        if (taskData.client && !clientName) {
            const client = await User.findById(taskData.client);
            clientName = client?.name;
        }

        // Get assigned user name if assignedTo provided
        let assignedToName = taskData.assignedToName;
        if (taskData.assignedTo && !assignedToName) {
            const assignee = await User.findById(taskData.assignedTo);
            assignedToName = assignee?.name;
        }

        const task = await Task.create({
            taskId,
            ...taskData,
            clientName,
            assignedToName,
        });

        // Update client's active task count
        if (taskData.client) {
            await User.findByIdAndUpdate(taskData.client, {
                $inc: { activeTasks: 1 },
            });
        }

        return task;
    }

    /**
     * Get task by ID
     */
    static async getById(taskId) {
        await dbConnect();
        const task = await Task.findById(taskId)
            .populate('client', 'name email company')
            .populate('assignedTo', 'name email');

        if (!task) {
            throw createError.notFound('Task');
        }
        return task;
    }

    /**
     * Update task
     */
    static async update(taskId, updateData) {
        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            throw createError.notFound('Task');
        }

        // Check if task is being completed
        const wasCompleted = task.isCompleted;
        const isNowCompleted = updateData.status === 'completed' || updateData.isCompleted;

        if (!wasCompleted && isNowCompleted) {
            updateData.completedDate = new Date();
            updateData.isCompleted = true;
            updateData.progressPercentage = 100;

            // Decrease client's active task count
            if (task.client) {
                await User.findByIdAndUpdate(task.client, {
                    $inc: { activeTasks: -1 },
                });
            }
        }

        // Update last updated time
        updateData.lastUpdated = 'Just now';

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return updatedTask;
    }

    /**
     * Delete task
     */
    static async delete(taskId) {
        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            throw createError.notFound('Task');
        }

        // Decrease client's active task count if task was not completed
        if (task.client && !task.isCompleted) {
            await User.findByIdAndUpdate(task.client, {
                $inc: { activeTasks: -1 },
            });
        }

        await Task.findByIdAndDelete(taskId);
        return { message: 'Task deleted successfully' };
    }

    /**
     * Get all tasks with filtering
     */
    static async getAll(filters = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            client,
            assignedTo,
            status,
            priority,
            service,
            isHighPriority,
        } = filters;

        const query = {};

        if (client) query.client = client;
        if (assignedTo) query.assignedTo = assignedTo;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (service) query.service = service;
        if (typeof isHighPriority === 'boolean') query.isHighPriority = isHighPriority;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate('client', 'name email company')
                .populate('assignedTo', 'name email')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Task.countDocuments(query),
        ]);

        return {
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get tasks by client
     */
    static async getByClient(clientId) {
        await dbConnect();
        return await Task.find({ client: clientId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Get tasks by assignee
     */
    static async getByAssignee(assigneeId) {
        await dbConnect();
        return await Task.find({ assignedTo: assigneeId })
            .populate('client', 'name email company')
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Update task status
     */
    static async updateStatus(taskId, status) {
        await dbConnect();
        return await this.update(taskId, { status });
    }

    /**
     * Assign task
     */
    static async assign(taskId, assigneeId, assigneeName) {
        await dbConnect();
        return await Task.findByIdAndUpdate(
            taskId,
            {
                assignedTo: assigneeId,
                assignedToName: assigneeName,
                lastUpdated: 'Just now',
            },
            { new: true }
        );
    }

    /**
     * Get task statistics
     */
    static async getStats(userId = null, role = null) {
        await dbConnect();

        const query = {};
        if (userId) {
            if (role === 'client') {
                query.client = userId;
            } else if (role === 'admin') {
                query.assignedTo = userId;
            }
        }

        const [statusCounts, priorityCounts] = await Promise.all([
            Task.aggregate([
                { $match: query },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Task.aggregate([
                { $match: query },
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]),
        ]);

        return {
            byStatus: statusCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byPriority: priorityCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            total: await Task.countDocuments(query),
            active: await Task.countDocuments({ ...query, isCompleted: false }),
            completed: await Task.countDocuments({ ...query, isCompleted: true }),
        };
    }
}

export default TaskService;
