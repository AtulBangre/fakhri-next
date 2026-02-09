import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { validateBody, schemas } from '@/middleware/validation';
import { withRateLimit } from '@/middleware/rateLimit';

// POST /api/auth/register - Register new user
export async function POST(request) {
    try {
        // Rate limiting
        const rateLimitError = await withRateLimit(request, 'auth');
        if (rateLimitError) return rateLimitError;

        const body = await request.json();

        // Validate input
        const validation = validateBody(body, schemas.register);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({
            email: validation.data.email.toLowerCase()
        });

        if (existingUser) {
            return apiError('An account with this email already exists', 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validation.data.password, salt);

        // Create user
        const user = await User.create({
            name: validation.data.name,
            email: validation.data.email.toLowerCase(),
            password: hashedPassword,
            phone: validation.data.phone || '',
            company: validation.data.company || '',
            role: 'client',
            status: 'pending',
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                soundEnabled: true,
                taskUpdates: true,
                paymentAlerts: true,
                marketingNews: false,
                weeklyDigest: true,
            },
        });

        // Remove password from response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        return apiSuccess(
            userResponse,
            'Registration successful! Please login to continue.',
            201
        );

    } catch (error) {
        console.error('Registration error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return apiError('An account with this email already exists', 409);
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Registration failed. Please try again.', 500);
    }
}
