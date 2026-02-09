import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireSuperAdmin } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { id } = await params;

        // Users can only access their own data unless they are admin/super-admin
        if (auth.user.id !== id && !['admin', 'super-admin'].includes(auth.user.role)) {
            return apiError('Forbidden', 403);
        }

        await dbConnect();

        const user = await User.findById(id)
            .select('-password')
            .populate('plan', 'name price period features')
            .lean();

        if (!user) {
            return apiError('User not found', 404);
        }

        // Format response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            phone: user.phone,
            avatar: user.avatar,
            plan: user.plan,
            planName: user.planName,
            planStartDate: user.planStartDate,
            planEndDate: user.planEndDate,
            manager: user.manager,
            managerName: user.managerName,
            salesManager: user.salesManager,
            marketplace: user.marketplace,
            userPermission: user.userPermission,
            accountAccessUrl: user.accountAccessUrl,
            leadSource: user.leadSource,
            listingManager: user.listingManager,
            activeTasks: user.activeTasks || 0,
            notificationSettings: user.notificationSettings,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        };

        return apiSuccess(userResponse);

    } catch (error) {
        console.error('Get user error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid user ID', 400);
        }

        return apiError('Failed to fetch user', 500);
    }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const { id } = await params;
        const body = await request.json();

        // Users can only update their own data unless they are super-admin
        const isSelf = auth.user.id === id;
        const isSuperAdmin = auth.user.role === 'super-admin';

        if (!isSelf && !isSuperAdmin) {
            return apiError('Forbidden', 403);
        }

        await dbConnect();

        // Prepare update data
        const updateData = {};

        // Fields that anyone can update for themselves
        const selfUpdateFields = [
            'name', 'phone', 'company', 'avatar', 'notificationSettings'
        ];

        // Fields that only super-admin can update
        const adminOnlyFields = [
            'role', 'status', 'plan', 'planName', 'planStartDate', 'planEndDate',
            'manager', 'managerName', 'salesManager', 'marketplace', 'userPermission',
            'accountAccessUrl', 'leadSource', 'listingManager', 'assignedClients'
        ];

        // Apply self-update fields
        selfUpdateFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        // Apply admin-only fields if super-admin
        if (isSuperAdmin) {
            adminOnlyFields.forEach(field => {
                if (body[field] !== undefined) {
                    updateData[field] = body[field];
                }
            });
        }

        // Handle password update
        if (body.password && isSuperAdmin) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(body.password, salt);
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return apiError('User not found', 404);
        }

        // Format response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            phone: user.phone,
            avatar: user.avatar,
            planName: user.planName,
            managerName: user.managerName,
            updatedAt: user.updatedAt,
        };

        return apiSuccess(userResponse, 'User updated successfully');

    } catch (error) {
        console.error('Update user error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid user ID', 400);
        }

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to update user', 500);
    }
}

// DELETE /api/users/[id] - Delete user (Super Admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const { id } = await params;

        // Prevent deleting self
        if (auth.user.id === id) {
            return apiError('Cannot delete your own account', 400);
        }

        await dbConnect();

        const user = await User.findById(id);

        if (!user) {
            return apiError('User not found', 404);
        }

        // Prevent deleting super-admin
        if (user.role === 'super-admin') {
            return apiError('Cannot delete super admin account', 403);
        }

        await User.findByIdAndDelete(id);

        return apiSuccess(null, 'User deleted successfully');

    } catch (error) {
        console.error('Delete user error:', error);

        if (error.name === 'CastError') {
            return apiError('Invalid user ID', 400);
        }

        return apiError('Failed to delete user', 500);
    }
}
