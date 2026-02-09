/**
 * User Service
 * Business logic for user operations
 */

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createError } from '@/middleware/errorHandler';
import { generateId } from '@/utils/generators';

export class UserService {
    /**
     * Create a new user
     */
    static async create(userData) {
        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
            throw createError.duplicate('Email');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = await User.create({
            ...userData,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            status: userData.status || 'pending',
        });

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    }

    /**
     * Get user by ID
     */
    static async getById(userId) {
        await dbConnect();
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw createError.notFound('User');
        }
        return user;
    }

    /**
     * Get user by email
     */
    static async getByEmail(email) {
        await dbConnect();
        return await User.findOne({ email: email.toLowerCase() }).select('-password');
    }

    /**
     * Get user by email with password (for authentication)
     */
    static async getByEmailWithPassword(email) {
        await dbConnect();
        return await User.findOne({ email: email.toLowerCase() }).select('+password');
    }

    /**
     * Update user
     */
    static async update(userId, updateData) {
        await dbConnect();

        // If updating password, hash it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw createError.notFound('User');
        }

        return user;
    }

    /**
     * Delete user
     */
    static async delete(userId) {
        await dbConnect();
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw createError.notFound('User');
        }
        return { message: 'User deleted successfully' };
    }

    /**
     * Get all users with filtering and pagination
     */
    static async getAll(filters = {}, options = {}) {
        await dbConnect();

        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            role,
            status,
            search,
            manager,
        } = { ...filters, ...options };

        const query = {};

        if (role) query.role = role;
        if (status) query.status = status;
        if (manager) query.manager = manager;

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
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get clients by manager
     */
    static async getClientsByManager(managerId) {
        await dbConnect();
        return await User.find({
            role: 'client',
            manager: managerId,
        }).select('-password').lean();
    }

    /**
     * Get unassigned clients
     */
    static async getUnassignedClients() {
        await dbConnect();
        return await User.find({
            role: 'client',
            manager: { $exists: false },
        }).select('-password').lean();
    }

    /**
     * Assign client to manager
     */
    static async assignToManager(clientId, managerId, managerName) {
        await dbConnect();
        return await User.findByIdAndUpdate(
            clientId,
            { manager: managerId, managerName },
            { new: true }
        ).select('-password');
    }

    /**
     * Update user status
     */
    static async updateStatus(userId, status) {
        await dbConnect();
        return await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select('-password');
    }

    /**
     * Compare password
     */
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Get dashboard stats
     */
    static async getDashboardStats() {
        await dbConnect();

        const [
            totalClients,
            activeClients,
            pendingClients,
            totalAdmins,
        ] = await Promise.all([
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'client', status: 'active' }),
            User.countDocuments({ role: 'client', status: 'pending' }),
            User.countDocuments({ role: 'admin' }),
        ]);

        return {
            totalClients,
            activeClients,
            pendingClients,
            totalAdmins,
            unassignedClients: await User.countDocuments({
                role: 'client',
                manager: { $exists: false },
            }),
        };
    }
}

export default UserService;
