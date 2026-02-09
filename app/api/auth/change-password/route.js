import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';

// POST /api/auth/change-password - Change user password
export async function POST(request) {
    try {
        // Rate limiting
        const rateLimitError = await withRateLimit(request, 'auth');
        if (rateLimitError) return rateLimitError;

        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return apiError('All password fields are required', 400);
        }

        if (newPassword !== confirmPassword) {
            return apiError('New passwords do not match', 400);
        }

        if (newPassword.length < 6) {
            return apiError('New password must be at least 6 characters', 400);
        }

        await dbConnect();

        // Get user with password
        const user = await User.findById(auth.user.id).select('+password');

        if (!user) {
            return apiError('User not found', 404);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return apiError('Current password is incorrect', 401);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(auth.user.id, {
            password: hashedPassword
        });

        return apiSuccess(null, 'Password changed successfully');

    } catch (error) {
        console.error('Change password error:', error);
        return apiError('Failed to change password. Please try again.', 500);
    }
}
