import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: {
        type: String,
        enum: ['super-admin', 'admin', 'client'],
        required: true
    },
    // Admin specific fields
    adminRole: { type: String }, // e.g., 'Account Manager', 'Senior Manager'
    team: { type: String },
    teamId: { type: Number },
    permissions: [{ type: String }],
    performance: {
        activeTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        clientSatisfaction: { type: String }
    },
    // Client specific fields
    company: { type: String },
    plan: { type: String },
    status: {
        type: String,
        enum: ['active', 'pending', 'disabled'],
        default: 'active'
    },
    manager: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    salesManager: { type: String },
    spCentralRequestId: { type: String },
    marketplace: { type: String },
    userPermission: { type: String },
    accountAccessUrl: { type: String },
    leadSource: { type: String },
    listingManager: { type: String },
    location: { type: String },
    subscribedServices: [{
        serviceId: { type: String },
        name: { type: String },
        subscribedDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
    }],
    joinedDate: { type: Date, default: Date.now },
    notificationSettings: {
        soundEnabled: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        taskUpdates: { type: Boolean, default: true },
        paymentAlerts: { type: Boolean, default: true },
        marketingNews: { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: true }
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
