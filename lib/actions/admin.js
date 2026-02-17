'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import { createNotification } from '@/lib/actions/notification';
import { sendEmail, emailTemplates, verifySMTP } from '@/lib/mail';

export { verifySMTP };

export async function sendClientEmail({ to, subject, body, fromAdmin }) {
    console.log('>>> Server Action: sendClientEmail triggered');
    await connectDB();
    try {
        const template = emailTemplates.clientMessage({
            subject,
            body,
            adminName: fromAdmin.name
        });

        const result = await sendEmail({
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
            replyTo: fromAdmin.email, // Ensure client replies go to the logged-in admin
            fromName: fromAdmin.name // Make it appear as from the admin
        });

        // Also notify client in-app
        const client = await User.findOne({ email: to });
        if (client) {
            await createNotification({
                recipientId: client._id,
                title: 'New Email Received',
                message: `You received an email from ${fromAdmin.name}: "${subject}"`,
                type: 'info',
                link: '#Dashboard'
            });
        }

        return result;
    } catch (error) {
        console.error('Error in sendClientEmail action:', error);
        return { success: false, error: error.message };
    }
}


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
                type: 'info',
                link: '#Files'
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
                    link: '#Dashboard'
                });

                // Notify super-admins about new client
                await notifySuperAdmins({
                    title: 'New Client Added',
                    message: `${client.name} (${client.company || 'N/A'}) has been added as a new client.`,
                    type: 'success',
                    link: '#Clients',
                    icon: 'UserPlus'
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
        const client = await User.findById(id).lean();
        await User.findByIdAndDelete(id);

        // Notify super-admins about deleted client
        if (client) {
            await notifySuperAdmins({
                title: 'Client Removed',
                message: `${client.name} (${client.company || 'N/A'}) has been removed.`,
                type: 'warning',
                link: '#Clients'
            });
        }

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
            // Generate taskId if creating new
            if (!updateData.taskId) {
                const count = await Task.countDocuments();
                updateData.taskId = `TSK-${String(count + 1).padStart(3, '0')}`;
            }
            task = await Task.create(updateData);
        }

        if (task) {
            const notifTitle = isNew ? 'New Task Assigned' : 'Task Updated';
            const notifMessage = isNew ? `You have a new task: "${task.title}"` : `Task "${task.title}" has been updated.`;

            // Notify Client
            if (task.client?.id) {
                await createNotification({
                    recipientId: task.client.id,
                    title: notifTitle,
                    message: notifMessage,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify Assignee
            if (task.assignee?.id) {
                await createNotification({
                    recipientId: task.assignee.id,
                    title: notifTitle,
                    message: notifMessage,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify super-admins about task
            const saMessage = isNew
                ? `New task "${task.title}" assigned to ${task.assignee?.name || 'Unassigned'} for ${task.client?.name || 'Unknown Client'}.`
                : `Task "${task.title}" has been updated.`;
            await notifySuperAdmins({
                title: notifTitle,
                message: saMessage,
                type: 'task',
                link: '#Tasks'
            });
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
        const task = await Task.findById(id).lean();
        if (task) {
            await Task.findByIdAndDelete(id);

            // Notify Assignee
            if (task.assignee?.id) {
                await createNotification({
                    recipientId: task.assignee.id,
                    title: 'Task Removed',
                    message: `Task "${task.title}" has been removed.`,
                    type: 'task',
                    link: '#Tasks'
                });
            }

            // Notify super-admins
            await notifySuperAdmins({
                title: 'Task Deleted',
                message: `Task "${task.title}" has been deleted.`,
                type: 'warning',
                link: '#Tasks',
                icon: 'Trash2'
            });
        }
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

export async function getTeamMembers() {
    await connectDB();
    try {
        const team = await User.find({ role: { $in: ['admin', 'super-admin'] } })
            .select('name email role _id')
            .sort({ name: 1 })
            .lean();
        return JSON.parse(JSON.stringify(team));
    } catch (error) {
        console.error('Error fetching team members:', error);
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

/**
 * Uploads a file and shares it with multiple clients
 * @param {FormData} formData - Contains the file and client info
 */
export async function uploadFiles(formData) {
    await connectDB();
    try {
        const file = formData.get('file');
        const selectedClients = JSON.parse(formData.get('clients') || '[]'); // Array of {id, name}
        const uploadedBy = formData.get('uploadedBy') || 'Admin';

        if (!file || selectedClients.length === 0) {
            throw new Error("File or clients missing");
        }

        // 1. Upload to Vercel Blob
        const { put } = await import('@vercel/blob');
        const token = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_SZFDjh9KdeU1EfbI_Z3lvVic5ELojJ2b8yE3xnnemAQl6Oe";

        const blob = await put(file.name, file, {
            access: 'public',
            token: token,
        });

        // 2. Create File records for each client
        const FileModel = (await import('@/models/File')).default;
        const fileType = file.name.split('.').pop().toLowerCase();
        let categorizedType = 'file';
        if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(fileType)) categorizedType = 'image';
        else if (['pdf'].includes(fileType)) categorizedType = 'pdf';
        else if (['xls', 'xlsx', 'csv'].includes(fileType)) categorizedType = 'excel';

        let fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        if (parseFloat(fileSize) < 0.1) {
            const kbSize = (file.size / 1024).toFixed(2) + ' KB';
            fileSize = kbSize;
        }

        const createdFiles = [];

        for (const client of selectedClients) {
            const newFile = await FileModel.create({
                name: file.name,
                clientId: client.id,
                clientName: client.name,
                type: categorizedType,
                size: (file.size / 1024 / 1024).toFixed(2) >= 0.1
                    ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
                    : (file.size / 1024).toFixed(2) + ' KB',
                version: '1.0',
                uploadedBy: uploadedBy,
                url: blob.url,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            });

            // 3. Notify Client
            await createNotification({
                recipientId: client.id,
                title: 'New File Received',
                message: `Admin has uploaded a new file: "${file.name}"`,
                type: 'info',
                link: '#Files'
            });

            createdFiles.push(newFile);
        }

        return { success: true, files: JSON.parse(JSON.stringify(createdFiles)) };
    } catch (error) {
        console.error('Error uploading files:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteFile(id) {
    await connectDB();
    try {
        const FileModel = (await import('@/models/File')).default;
        await FileModel.findByIdAndDelete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, error: error.message };
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
                    link: '#Dashboard'
                });

                // Notify super-admins about new admin
                await notifySuperAdmins({
                    title: 'New Admin Created',
                    message: `${admin.name} (${admin.email}) has been added as an admin.`,
                    type: 'success',
                    link: '#Admins',
                    icon: 'UserPlus'
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
        const admin = await User.findById(id).lean();
        await User.findByIdAndDelete(id);

        // Notify super-admins about deleted admin
        if (admin) {
            await notifySuperAdmins({
                title: 'Admin Removed',
                message: `${admin.name} (${admin.email}) has been removed as an admin.`,
                type: 'warning',
                link: '#Admins'
            });
        }

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
