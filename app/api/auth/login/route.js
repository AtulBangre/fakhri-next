import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { withRateLimit } from '@/middleware/rateLimit';

// POST /api/auth/login - Login user (for custom login if needed)
export async function POST(request) {
    try {
        // Rate limiting for login attempts
        const rateLimitError = await withRateLimit(request, 'auth');
        if (rateLimitError) return rateLimitError;

        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return apiError('Email and password are required', 400);
        }

        await dbConnect();

        // Find user with password
        const user = await User.findOne({
            email: email.toLowerCase()
        }).select('+password');

        if (!user) {
            return apiError('Invalid email or password', 401);
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return apiError('Invalid email or password', 401);
        }

        // Check if user is suspended
        if (user.status === 'suspended') {
            return apiError('Your account has been suspended. Please contact support.', 403);
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
        });

        // Return user data (without password)
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            planName: user.planName,
            avatar: user.avatar,
        };

        return apiSuccess(userResponse, 'Login successful');

    } catch (error) {
        console.error('Login error:', error);
        return apiError('Login failed. Please try again.', 500);
    }
}
