import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Task from '@/models/Task';
import Transaction from '@/models/Transaction';
import ContactMessage from '@/models/ContactMessage';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth } from '@/middleware/auth';

// GET /api/dashboard - Get dashboard data based on user role
export async function GET(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const role = auth.user.role;

        let dashboardData;

        if (role === 'super-admin') {
            dashboardData = await getSuperAdminDashboard();
        } else if (role === 'admin') {
            dashboardData = await getAdminDashboard(auth.user.id);
        } else {
            dashboardData = await getClientDashboard(auth.user.id);
        }

        return apiSuccess(dashboardData);

    } catch (error) {
        console.error('Get dashboard error:', error);
        return apiError('Failed to fetch dashboard data', 500);
    }
}

// Super Admin Dashboard
async function getSuperAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
        totalClients,
        activeClients,
        pendingClients,
        totalAdmins,
        totalOrders,
        monthlyOrders,
        monthlyRevenue,
        lastMonthRevenue,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingMessages,
        recentOrders,
        recentClients,
    ] = await Promise.all([
        User.countDocuments({ role: 'client' }),
        User.countDocuments({ role: 'client', status: 'active' }),
        User.countDocuments({ role: 'client', status: 'pending' }),
        User.countDocuments({ role: 'admin' }),
        Order.countDocuments(),
        Order.countDocuments({ orderDate: { $gte: startOfMonth } }),
        Order.aggregate([
            { $match: { orderDate: { $gte: startOfMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.aggregate([
            { $match: { orderDate: { $gte: startOfLastMonth, $lt: startOfMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ status: 'in-progress' }),
        ContactMessage.countDocuments({ status: { $in: ['new', 'read'] } }),
        Order.find()
            .populate('user', 'name company')
            .sort({ orderDate: -1 })
            .limit(5)
            .lean(),
        User.find({ role: 'client' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email company status planName createdAt')
            .lean(),
    ]);

    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : 0;

    return {
        stats: {
            totalClients,
            activeClients,
            pendingClients,
            totalAdmins,
            totalOrders,
            monthlyOrders,
            monthlyRevenue: currentRevenue,
            revenueGrowth,
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingMessages,
            taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentOrders: recentOrders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            planName: order.planName,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            customerName: order.user?.name,
            company: order.user?.company,
            date: order.orderDate,
        })),
        recentClients: recentClients.map(client => ({
            id: client._id,
            name: client.name,
            email: client.email,
            company: client.company,
            status: client.status,
            planName: client.planName,
            joinedAt: client.createdAt,
        })),
    };
}

// Admin Dashboard
async function getAdminDashboard(adminId) {
    const [
        assignedClients,
        activeClients,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        highPriorityTasks,
        recentTasks,
        clientsList,
    ] = await Promise.all([
        User.countDocuments({ manager: adminId, role: 'client' }),
        User.countDocuments({ manager: adminId, role: 'client', status: 'active' }),
        Task.countDocuments({ assignedTo: adminId }),
        Task.countDocuments({ assignedTo: adminId, status: 'completed' }),
        Task.countDocuments({ assignedTo: adminId, status: 'in-progress' }),
        Task.countDocuments({ assignedTo: adminId, status: 'pending' }),
        Task.countDocuments({ assignedTo: adminId, isHighPriority: true, status: { $ne: 'completed' } }),
        Task.find({ assignedTo: adminId })
            .populate('client', 'name company')
            .sort({ isHighPriority: -1, dueDate: 1 })
            .limit(10)
            .lean(),
        User.find({ manager: adminId, role: 'client' })
            .select('name email company status planName activeTasks')
            .limit(10)
            .lean(),
    ]);

    return {
        stats: {
            assignedClients,
            activeClients,
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            highPriorityTasks,
            taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentTasks: recentTasks.map(task => ({
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            clientName: task.client?.name || task.clientName,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            isHighPriority: task.isHighPriority,
            progressPercentage: task.progressPercentage,
        })),
        clients: clientsList.map(client => ({
            id: client._id,
            name: client.name,
            email: client.email,
            company: client.company,
            status: client.status,
            planName: client.planName,
            activeTasks: client.activeTasks || 0,
        })),
    };
}

// Client Dashboard
async function getClientDashboard(clientId) {
    const client = await User.findById(clientId)
        .populate('plan', 'name price features')
        .lean();

    const [
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        recentTasks,
        totalOrders,
        recentOrders,
    ] = await Promise.all([
        Task.countDocuments({ client: clientId }),
        Task.countDocuments({ client: clientId, status: 'completed' }),
        Task.countDocuments({ client: clientId, status: 'in-progress' }),
        Task.countDocuments({ client: clientId, status: 'pending' }),
        Task.find({ client: clientId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean(),
        Order.countDocuments({ user: clientId }),
        Order.find({ user: clientId })
            .sort({ orderDate: -1 })
            .limit(3)
            .lean(),
    ]);

    // Calculate plan days remaining
    let daysRemaining = null;
    if (client.planEndDate) {
        const now = new Date();
        const endDate = new Date(client.planEndDate);
        daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) daysRemaining = 0;
    }

    return {
        profile: {
            name: client.name,
            email: client.email,
            company: client.company,
            planName: client.planName,
            planStartDate: client.planStartDate,
            planEndDate: client.planEndDate,
            daysRemaining,
            managerName: client.managerName,
        },
        stats: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            totalOrders,
            taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        recentTasks: recentTasks.map(task => ({
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            service: task.service,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            progressPercentage: task.progressPercentage,
            lastUpdated: task.lastUpdated,
        })),
        recentOrders: recentOrders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            planName: order.planName,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            date: order.orderDate,
        })),
    };
}
