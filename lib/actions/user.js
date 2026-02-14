'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function getUsers({
    role = '',
    status = '',
    search = '',
    page = 1,
    limit = 10,
    managerId = null
} = {}) {
    await connectDB();
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (managerId) query.managerId = managerId;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const users = await User.find(query)
            .sort({ joinedDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        return {
            users: JSON.parse(JSON.stringify(users)),
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0, pages: 0, error: 'Failed to fetch users' };
    }
}

export async function getUserById(id) {
    await connectDB();
    try {
        const user = await User.findById(id).lean();
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function getUserByEmail(email) {
    await connectDB();
    try {
        const user = await User.findOne({ email }).lean();
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
}

export async function updatePerformance(userId, performance) {
    await connectDB();
    try {
        const user = await User.findByIdAndUpdate(userId, {
            $set: { performance }
        }, { new: true }).lean();
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error('Error updating performance:', error);
        return null;
    }
}

export async function updateUser(userId, data) {
    await connectDB();
    try {
        const user = await User.findByIdAndUpdate(userId, data, { new: true }).lean();
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error('Error updating user:', error);
        return null;
    }
}

/**
 * Adds or updates subscribed services for a client
 * @param {string} userId - The ID of the client
 * @param {Array} services - Array of service objects { serviceId, name }
 */
export async function addClientSubscribedServices(userId, services) {
    await connectDB();
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (!user.subscribedServices) {
            user.subscribedServices = [];
        }

        services.forEach(newService => {
            const existingIndex = user.subscribedServices.findIndex(s => s.serviceId === newService.serviceId);
            if (existingIndex > -1) {
                user.subscribedServices[existingIndex].status = 'active';
                user.subscribedServices[existingIndex].subscribedDate = new Date();
            } else {
                user.subscribedServices.push({
                    serviceId: newService.serviceId,
                    name: newService.name,
                    status: 'active',
                    subscribedDate: new Date()
                });
            }
        });

        await user.save();
        return { success: true, message: "Services updated successfully" };
    } catch (error) {
        console.error("Error updating client services:", error);
        return { success: false, error: error.message };
    }
}

