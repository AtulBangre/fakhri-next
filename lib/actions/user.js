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

export async function updatePaymentMethod(userId, methodData) {
    await connectDB();
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (!user.paymentMethods) user.paymentMethods = [];

        // If this is the first method, make it default
        if (user.paymentMethods.length === 0) {
            methodData.isDefault = true;
        }

        if (methodData.isDefault) {
            user.paymentMethods.forEach(m => m.isDefault = false);
        }

        user.paymentMethods.push(methodData);
        await user.save();

        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
        console.error('Error updating payment method:', error);
        return { success: false, error: error.message };
    }
}

export async function setDefaultPaymentMethod(userId, methodIndex) {
    await connectDB();
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (user.paymentMethods && user.paymentMethods[methodIndex]) {
            user.paymentMethods.forEach((m, idx) => {
                m.isDefault = idx === methodIndex;
            });
            await user.save();
            return { success: true, user: JSON.parse(JSON.stringify(user)) };
        }
        return { success: false, error: "Method not found" };
    } catch (error) {
        console.error('Error setting default payment method:', error);
        return { success: false, error: error.message };
    }
}

export async function deletePaymentMethod(userId, methodIndex) {
    await connectDB();
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (user.paymentMethods && user.paymentMethods[methodIndex]) {
            const wasDefault = user.paymentMethods[methodIndex].isDefault;
            user.paymentMethods.splice(methodIndex, 1);

            // If we deleted the default, make the first one left the new default
            if (wasDefault && user.paymentMethods.length > 0) {
                user.paymentMethods[0].isDefault = true;
            }

            await user.save();
            return { success: true, user: JSON.parse(JSON.stringify(user)) };
        }
        return { success: false, error: "Method not found" };
    } catch (error) {
        console.error('Error deleting payment method:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Adds or updates subscribed services for a client and generates an invoice
 * @param {string} userId - The ID of the client
 * @param {Array} services - Array of service objects { serviceId, name, price, quantity, total }
 */
export async function addClientSubscribedServices(userId, services) {
    await connectDB();
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (!user.subscribedServices) {
            user.subscribedServices = [];
        }

        let totalInvoiceAmount = 0;
        const invoiceItems = [];

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

            // Prepare invoice items
            if (newService.price) {
                totalInvoiceAmount += newService.total || (newService.price * (newService.quantity || 1));
                invoiceItems.push({
                    description: newService.name,
                    qty: newService.quantity || 1,
                    price: String(newService.price),
                    total: String(newService.total || (newService.price * (newService.quantity || 1)))
                });
            }
        });

        await user.save();

        // Generate Invoice if there are items with price
        if (invoiceItems.length > 0) {
            const { createInvoice } = await import('@/lib/actions/invoice');
            await createInvoice({
                client: {
                    name: user.name,
                    company: user.company,
                    id: user._id
                },
                amount: String(totalInvoiceAmount),
                status: 'Paid', // Assuming instant payment for demo, or 'Pending'
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: invoiceItems,
                paymentMethod: user.paymentMethods?.find(m => m.isDefault)?.type || 'Credit Card'
            });
        }

        return { success: true, message: "Services updated and invoice generated" };
    } catch (error) {
        console.error("Error updating client services:", error);
        return { success: false, error: error.message };
    }
}

