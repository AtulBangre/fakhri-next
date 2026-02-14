'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import { createNotification } from '@/lib/actions/notification';

export async function getNotes(clientId) {
    await connectDB();
    try {
        const notes = await Note.find({ clientId }).sort({ date: -1 }).lean();
        return JSON.parse(JSON.stringify(notes));
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
}

export async function upsertNote(noteData) {
    await connectDB();
    try {
        const note = await Note.create(noteData);

        // Notify Client about new note
        if (note && note.clientId) {
            await createNotification({
                recipientId: note.clientId,
                title: 'New Note Added',
                message: 'A new note has been added to your file.',
                type: 'note',
                link: '/client/dashboard'
            });
        }

        return JSON.parse(JSON.stringify(note));
    } catch (error) {
        console.error('Error creating note:', error);
        return null;
    }
}


export async function getClients(filter = {}) {
    await connectDB();
    try {
        const query = { role: 'client', ...filter };
        const clients = await User.find(query).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(clients));
    } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
}

export async function upsertClient(clientData) {
    await connectDB();
    try {
        const id = clientData._id || clientData.id;
        let client;

        // Remove _id from data to avoid immutable field error on update if it exists
        const { _id, ...updateData } = clientData;

        if (id && id.toString().length >= 12) {
            client = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
        } else {
            // Ensure email uniqueness
            const existing = await User.findOne({ email: clientData.email });
            if (existing) {
                throw new Error("A user with this email already exists");
            }
            client = await User.create({ ...clientData, role: 'client' });

            // Notify new client
            if (client) {
                await createNotification({
                    recipientId: client._id,
                    title: 'Welcome to Dashboard',
                    message: `Welcome ${client.name}! Your account has been created.`,
                    type: 'info',
                    link: '/client/dashboard'
                });
            }
        }
        return JSON.parse(JSON.stringify(client));
    } catch (error) {
        console.error('Error upserting client:', error);
        return null; // Or throw error to be handled by UI
    }
}

export async function deleteClient(id) {
    await connectDB();
    try {
        await User.findByIdAndDelete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting client:', error);
        return { success: false, error: error.message };
    }
}

export async function toggleClientStatus(id, status) {
    await connectDB();
    try {
        const client = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
        return JSON.parse(JSON.stringify(client));
    } catch (error) {
        console.error('Error toggling client status:', error);
        return null;
    }
}

export async function getTasks(filter = {}) {
    await connectDB();
    try {
        const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(tasks));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function upsertTask(taskData) {
    await connectDB();
    try {
        const id = taskData._id || taskData.id;
        let task;
        const isNew = !(id && id.toString().length >= 12);

        const { _id, ...updateData } = taskData;

        if (!isNew) {
            task = await Task.findByIdAndUpdate(id, updateData, { new: true }).lean();
        } else {
            if (!taskData.taskId) {
                const count = await Task.countDocuments();
                taskData.taskId = `TSK-${String(count + 1).padStart(3, '0')}`;
            }
            task = await Task.create(updateData);
        }

        if (task) {
            const title = isNew ? 'New Task Assigned' : 'Task Updated';
            const message = isNew ? `You have a new task: "${task.title}"` : `Task "${task.title}" has been updated.`;

            // Notify Client
            if (task.client?.id) {
                await createNotification({
                    recipientId: task.client.id,
                    title,
                    message,
                    type: 'task',
                    link: '/client/dashboard'
                });
            }

            // Notify Assignee
            if (task.assignee?.id) {
                await createNotification({
                    recipientId: task.assignee.id,
                    title,
                    message,
                    type: 'task',
                    link: '/admin/dashboard'
                });
            }
        }

        return JSON.parse(JSON.stringify(task));
    } catch (error) {
        console.error('Error upserting task:', error);
        return null;
    }
}

export async function deleteTask(id) {
    await connectDB();
    try {
        await Task.findByIdAndDelete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false };
    }
}

export async function getAdmins() {
    await connectDB();
    try {
        const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 }).lean();

        // Fetch client counts for each admin
        const adminsWithCounts = await Promise.all(admins.map(async (admin) => {
            const count = await User.countDocuments({ role: 'client', managerId: admin._id });
            return {
                ...admin,
                clientsCount: count
            };
        }));

        return JSON.parse(JSON.stringify(adminsWithCounts));
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

export async function getFiles(filter = {}) {
    await connectDB();
    try {
        const FileModel = (await import('@/models/File')).default;
        const files = await FileModel.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(files));
    } catch (error) {
        console.error('Error fetching files:', error);
        return [];
    }
}

export async function upsertAdmin(adminData) {
    await connectDB();
    try {
        const id = adminData._id || adminData.id;
        let admin;

        const { _id, ...updateData } = adminData;

        if (id && id.toString().length >= 12) {
            admin = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
        } else {
            const existing = await User.findOne({ email: adminData.email });
            if (existing) {
                throw new Error("A user with this email already exists");
            }
            admin = await User.create({ ...adminData, role: 'admin' });

            if (admin) {
                await createNotification({
                    recipientId: admin._id,
                    title: 'Welcome Admin',
                    message: `Welcome ${admin.name}! Your admin account is ready.`,
                    type: 'info',
                    link: '/admin/dashboard'
                });
            }
        }
        return JSON.parse(JSON.stringify(admin));
    } catch (error) {
        console.error('Error upserting admin:', error);
        throw new Error(error.message || 'Failed to preserve admin');
    }
}

export async function deleteAdmin(id) {
    await connectDB();
    try {
        await User.findByIdAndDelete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting admin:', error);
        return { success: false, error: error.message };
    }
}

export async function toggleAdminStatus(id, status) {
    await connectDB();
    try {
        const admin = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
        return JSON.parse(JSON.stringify(admin));
    } catch (error) {
        console.error('Error toggling admin status:', error);
        return null;
    }
}
