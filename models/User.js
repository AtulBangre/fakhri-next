import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['super-admin', 'admin', 'client'],
        default: 'client',
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    company: {
        type: String,
        trim: true,
    },
    // Client-specific fields
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
    },
    planName: {
        type: String,
        enum: ['Elite', 'Premium', 'Platinum', null],
        default: null,
    },
    planStartDate: Date,
    planEndDate: Date,
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'inactive'],
        default: 'pending',
    },
    // Admin-specific fields
    assignedClients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    managerName: String,
    // Additional client fields
    salesManager: String,
    spCentralRequestId: String,
    marketplace: {
        type: String,
        default: 'Amazon India',
    },
    userPermission: {
        type: String,
        default: 'Full Access',
    },
    accountAccessUrl: String,
    leadSource: String,
    listingManager: String,
    activeTasks: {
        type: Number,
        default: 0,
    },
    // Timestamps
    joinedDate: {
        type: Date,
        default: Date.now,
    },
    lastLogin: Date,
    // Notification preferences
    notificationSettings: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        soundEnabled: { type: Boolean, default: true },
        taskUpdates: { type: Boolean, default: true },
        paymentAlerts: { type: Boolean, default: true },
        marketingNews: { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: true },
    },
    // For password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Google OAuth
    googleId: String,
    isGoogleUser: {
        type: Boolean,
        default: false,
    },
    // Session Management
    sessionVersion: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ manager: 1 });
UserSchema.index({ planName: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
