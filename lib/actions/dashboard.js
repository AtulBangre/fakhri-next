'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Invoice from '@/models/Invoice';
import ActivityLog from '@/models/ActivityLog';

export async function getDashboardStats() {
    await connectDB();
    try {
        const clientCount = await User.countDocuments({ role: 'client' });
        const adminCount = await User.countDocuments({ role: 'admin' });
        const activeTasks = await Task.countDocuments({ status: { $in: ['To Do', 'In Progress', 'In Review'] } });
        const completedTasks = await Task.countDocuments({ status: 'Completed' });

        const invoices = await Invoice.find({ status: 'Paid' }).lean();
        const totalRevenue = invoices.reduce((sum, inv) => {
            const val = parseFloat(inv.amount.replace(/[^0-9.]/g, ''));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const recentActivities = await ActivityLog.find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        return {
            stats: {
                clients: clientCount,
                admins: adminCount,
                activeTasks,
                completedTasks,
                revenue: `₹${totalRevenue.toLocaleString()}`
            },
            recentActivities: JSON.parse(JSON.stringify(recentActivities))
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

export async function logActivity(data) {
    await connectDB();
    try {
        const log = await ActivityLog.create(data);
        return JSON.parse(JSON.stringify(log));
    } catch (error) {
        console.error('Error logging activity:', error);
        return null;
    }
}
