import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Plan, Product, Order, Transaction, Task, Invoice, Service } from '@/models';

export async function GET() {
    try {
        await dbConnect();

        // Get counts from all collections
        const [
            usersCount,
            plansCount,
            productsCount,
            ordersCount,
            transactionsCount,
            tasksCount,
            invoicesCount,
            servicesCount,
        ] = await Promise.all([
            User.countDocuments(),
            Plan.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Transaction.countDocuments(),
            Task.countDocuments(),
            Invoice.countDocuments(),
            Service.countDocuments(),
        ]);

        // Get breakdown by user role
        const [superAdmins, admins, clients] = await Promise.all([
            User.countDocuments({ role: 'super-admin' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'client' }),
        ]);

        return NextResponse.json({
            success: true,
            message: 'Database seeded and ready',
            data: {
                collections: {
                    users: usersCount,
                    plans: plansCount,
                    products: productsCount,
                    orders: ordersCount,
                    transactions: transactionsCount,
                    tasks: tasksCount,
                    invoices: invoicesCount,
                    services: servicesCount,
                },
                userBreakdown: {
                    superAdmins,
                    admins,
                    clients,
                },
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Seed status check error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to check seed status',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
