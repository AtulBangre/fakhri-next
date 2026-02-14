'use server';

import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function getNotifications({ recipientId, limit = 50 }) {
    await connectDB();
    try {
        const notifications = await Notification.find({ recipientId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return JSON.parse(JSON.stringify(notifications));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function createNotification({ recipientId, title, message, type = 'info', link = '#', icon }) {
    await connectDB();
    try {
        // Auto-assign icon based on type if not explicitly provided
        const typeIconMap = {
            task: 'ClipboardList',
            invoice: 'CreditCard',
            success: 'CheckCircle',
            warning: 'AlertTriangle',
            error: 'AlertTriangle',
            info: 'MessageSquare',
        };
        const resolvedIcon = icon || typeIconMap[type] || 'MessageSquare';

        const notification = await Notification.create({
            recipientId,
            title,
            message,
            type,
            icon: resolvedIcon,
            link
        });
        return JSON.parse(JSON.stringify(notification));
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

export async function markNotificationAsRead(notificationId) {
    await connectDB();
    try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }
}

export async function markAllNotificationsAsRead(recipientId) {
    await connectDB();
    try {
        await Notification.updateMany({ recipientId, read: false }, { read: true });
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false };
    }
}

export async function deleteNotification(notificationId) {
    await connectDB();
    try {
        await Notification.findByIdAndDelete(notificationId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false };
    }
}

export async function clearAllNotifications(recipientId) {
    await connectDB();
    try {
        await Notification.deleteMany({ recipientId });
        return { success: true };
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return { success: false };
    }
}
