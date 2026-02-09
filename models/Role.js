import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        enum: ['super-admin', 'admin', 'client'],
    },
    displayName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    permissions: [{
        module: {
            type: String,
            required: true,
            enum: [
                'dashboard',
                'clients',
                'admins',
                'tasks',
                'orders',
                'transactions',
                'invoices',
                'files',
                'services',
                'plans',
                'products',
                'settings',
                'reports',
                'cms',
                'notifications',
                'teams',
            ],
        },
        actions: [{
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'manage'],
        }],
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    isSystem: {
        type: Boolean,
        default: false, // System roles cannot be deleted
    },
}, {
    timestamps: true,
});

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

// Static method to get default permissions for a role
RoleSchema.statics.getDefaultPermissions = function (roleName) {
    const permissions = {
        'super-admin': [
            { module: 'dashboard', actions: ['read', 'manage'] },
            { module: 'clients', actions: ['create', 'read', 'update', 'delete', 'manage'] },
            { module: 'admins', actions: ['create', 'read', 'update', 'delete', 'manage'] },
            { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'manage'] },
            { module: 'orders', actions: ['create', 'read', 'update', 'delete', 'manage'] },
            { module: 'transactions', actions: ['read', 'manage'] },
            { module: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'files', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'services', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'plans', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'settings', actions: ['read', 'update', 'manage'] },
            { module: 'reports', actions: ['read', 'manage'] },
            { module: 'cms', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'notifications', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        ],
        'admin': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'clients', actions: ['read', 'update'] },
            { module: 'tasks', actions: ['create', 'read', 'update'] },
            { module: 'files', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'notifications', actions: ['read', 'update'] },
        ],
        'client': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'tasks', actions: ['read'] },
            { module: 'orders', actions: ['create', 'read'] },
            { module: 'invoices', actions: ['read'] },
            { module: 'files', actions: ['read'] },
            { module: 'notifications', actions: ['read', 'update'] },
        ],
    };
    return permissions[roleName] || [];
};

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
