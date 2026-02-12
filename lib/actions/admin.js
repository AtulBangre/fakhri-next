'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';

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
        return JSON.parse(JSON.stringify(note));
    } catch (error) {
        console.error('Error creating note:', error);
        return null;
    }
}


export async function getClients() {
    await connectDB();
    try {
        const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 }).lean();
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
        }
        return JSON.parse(JSON.stringify(client));
    } catch (error) {
        console.error('Error upserting client:', error);
        return null; // Or throw error to be handled by UI
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

        const { _id, ...updateData } = taskData;

        if (id && id.toString().length >= 12) {
            task = await Task.findByIdAndUpdate(id, updateData, { new: true }).lean();
        } else {
            // Simple ID generation if needed, though Mongo ID is preferred. 
            // The Task schema has taskId (String) which might be a custom ID like "TSK-001"
            if (!taskData.taskId) {
                const count = await Task.countDocuments();
                taskData.taskId = `TSK-${String(count + 1).padStart(3, '0')}`;
            }
            task = await Task.create(updateData);
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
        return JSON.parse(JSON.stringify(admins));
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
