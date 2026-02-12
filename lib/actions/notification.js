'use server';

import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function getNotifications(recipientId) {
    await connectDB();
    try {
        const notifications = await Notification.find({ recipientId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        return JSON.parse(JSON.stringify(notifications));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
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
