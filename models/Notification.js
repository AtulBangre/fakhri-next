import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true,
    },
    // Recipient
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Notification content
    type: {
        type: String,
        enum: ['alert', 'success', 'warning', 'info'],
        default: 'info',
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    // Display
    icon: String,
    actionUrl: String,
    actionText: String,
    // Status
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: Date,
    // Related entities
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Metadata
    category: {
        type: String,
        enum: ['task', 'payment', 'client', 'system', 'general'],
        default: 'general',
    },
    // For time display
    time: String,
}, {
    timestamps: true,
});

// Indexes

NotificationSchema.index({ user: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ category: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
