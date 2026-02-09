import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth } from '@/middleware/auth';

// GET /api/users/me - Get current user profile
export async function GET() {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        await dbConnect();

        const user = await User.findById(auth.user.id)
            .select('-password')
            .populate('plan', 'name price period features description')
            .lean();

        if (!user) {
            return apiError('User not found', 404);
        }

        // Calculate days remaining in plan
        let daysRemaining = null;
        if (user.planEndDate) {
            const now = new Date();
            const endDate = new Date(user.planEndDate);
            daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            if (daysRemaining < 0) daysRemaining = 0;
        }

        // Format response for frontend
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            phone: user.phone,
            avatar: user.avatar,
            // Plan details
            plan: user.plan,
            planName: user.planName,
            planStartDate: user.planStartDate,
            planEndDate: user.planEndDate,
            daysRemaining,
            // Management details
            manager: user.manager,
            managerName: user.managerName,
            salesManager: user.salesManager,
            marketplace: user.marketplace,
            userPermission: user.userPermission,
            accountAccessUrl: user.accountAccessUrl,
            leadSource: user.leadSource,
            listingManager: user.listingManager,
            // Stats
            activeTasks: user.activeTasks || 0,
            // Settings
            notificationSettings: user.notificationSettings || {
                emailNotifications: true,
                pushNotifications: true,
                soundEnabled: true,
                taskUpdates: true,
                paymentAlerts: true,
                marketingNews: false,
                weeklyDigest: true,
            },
            // Timestamps
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        };

        return apiSuccess(userResponse);

    } catch (error) {
        console.error('Get profile error:', error);
        return apiError('Failed to fetch profile', 500);
    }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const body = await request.json();

        await dbConnect();

        // Fields that users can update themselves
        const allowedFields = [
            'name', 'phone', 'company', 'avatar', 'notificationSettings'
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            auth.user.id,
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
            company: user.company,
            phone: user.phone,
            avatar: user.avatar,
            notificationSettings: user.notificationSettings,
        };

        return apiSuccess(userResponse, 'Profile updated successfully');

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to update profile', 500);
    }
}
