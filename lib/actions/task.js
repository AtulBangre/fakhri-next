'use server';

import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { createNotification } from '@/lib/actions/notification';

// Helper: notify all super-admins about an event
async function notifySuperAdmins({ title, message, type = 'info', link = '#Dashboard', icon }) {
    try {
        const superAdmins = await User.find({ role: 'super-admin' }).select('_id').lean();
        await Promise.all(
            superAdmins.map(sa =>
                createNotification({ recipientId: sa._id, title, message, type, link, icon })
            )
        );
    } catch (error) {
        console.error('Error notifying super-admins:', error);
    }
}

export async function getTasks({
    page = 1,
    limit = 10,
    status = '',
    priority = '',
    clientId = null,
    assigneeId = null,
    search = ''
} = {}) {
    await connectDB();
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (clientId) query['client.id'] = clientId;
    if (assigneeId) query['assignee.id'] = assigneeId;

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'client.name': { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const tasks = await Task.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Task.countDocuments(query);

        return {
            tasks: JSON.parse(JSON.stringify(tasks)),
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { tasks: [], total: 0, pages: 0, error: 'Failed to fetch tasks' };
    }
}

export async function updateTaskStatus(taskId, status) {
    await connectDB();
    try {
        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true }).lean();

        if (task) {
            // Notify Client
            if (task.client?.id) {
                await createNotification({
                    recipientId: task.client.id,
                    title: 'Task Status Updated',
                    message: `Task "${task.title}" is now ${status}`,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify Assignee
            if (task.assignee?.id) {
                await createNotification({
                    recipientId: task.assignee.id,
                    title: 'Task Status Updated',
                    message: `Task "${task.title}" is now ${status}`,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify super-admins
            await notifySuperAdmins({
                title: 'Task Status Updated',
                message: `Task "${task.title}" is now ${status} (${task.client?.name || 'Unknown Client'}).`,
                type: 'task',
                link: '#Tasks'
            });
        }

        return JSON.parse(JSON.stringify(task));
    } catch (error) {
        console.error('Error updating task status:', error);
        return null;
    }
}

export async function addTaskUpdate(taskId, update) {
    await connectDB();
    try {
        const task = await Task.findByIdAndUpdate(taskId, {
            $push: { updates: { ...update, date: new Date() } }
        }, { new: true }).lean();

        if (task) {
            // Notify Client
            if (task.client?.id) {
                await createNotification({
                    recipientId: task.client.id,
                    title: 'New Task Update',
                    message: `New update on task "${task.title}"`,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify Assignee
            if (task.assignee?.id) {
                await createNotification({
                    recipientId: task.assignee.id,
                    title: 'New Task Update',
                    message: `New update on task "${task.title}"`,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify super-admins
            await notifySuperAdmins({
                title: 'New Task Update',
                message: `Update posted on task "${task.title}" for ${task.client?.name || 'Unknown Client'}.`,
                type: 'task',
                link: '#Tasks'
            });
        }

        return JSON.parse(JSON.stringify(task));
    } catch (error) {
        console.error('Error adding task update:', error);
        return null;
    }
}
