import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { apiSuccess, apiError, apiPaginated } from '@/utils/apiResponse';
import { requireAuth, requireRole, requireSuperAdmin } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users with filtering and pagination
export async function GET(request) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const manager = searchParams.get('manager');

        await dbConnect();

        const query = {};

        // Apply filters
        if (role) query.role = role;
        if (status) query.status = status;
        if (manager) query.manager = manager;

        // Admin can only see their assigned clients
        if (auth.user.role === 'admin') {
            query.manager = auth.user.id;
            query.role = 'client';
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        // Format users for frontend
        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            phone: user.phone,
            avatar: user.avatar,
            planName: user.planName,
            planStartDate: user.planStartDate,
            planEndDate: user.planEndDate,
            manager: user.manager,
            managerName: user.managerName,
            activeTasks: user.activeTasks || 0,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        }));

        return NextResponse.json({
            success: true,
            data: formattedUsers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Get users error:', error);
        return apiError('Failed to fetch users', 500);
    }
}

// POST /api/users - Create new user (Super Admin only)
export async function POST(request) {
    try {
        const auth = await requireSuperAdmin();
        if (!auth.authorized) return auth.error;

        const body = await request.json();

        // Validate input
        const validation = validateBody(body, schemas.register);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({
            email: validation.data.email.toLowerCase()
        });

        if (existingUser) {
            return apiError('User with this email already exists', 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validation.data.password || '123456', salt);

        // Create user
        const user = await User.create({
            ...body,
            email: validation.data.email.toLowerCase(),
            password: hashedPassword,
            role: body.role || 'client',
            status: body.status || 'pending',
        });

        // Return formatted response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            company: user.company,
            phone: user.phone,
            createdAt: user.createdAt,
        };

        return apiSuccess(userResponse, 'User created successfully', 201);

    } catch (error) {
        console.error('Create user error:', error);

        if (error.code === 11000) {
            return apiError('User with this email already exists', 409);
        }

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to create user', 500);
    }
}
