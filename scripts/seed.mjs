import mongoose from 'mongoose';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import BlogPost from '../models/BlogPost.js';
import Service from '../models/Service.js';
import PricingPlan from '../models/PricingPlan.js';
import FAQ from '../models/FAQ.js';
import Testimonial from '../models/Testimonial.js';
import Task from '../models/Task.js';
import Invoice from '../models/Invoice.js';
import TeamMember from '../models/TeamMember.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

import { admins } from '../data/admins.js';
import { clients } from '../data/clients.js';
import { allBlogPosts } from '../data/allBlogPosts.js';
import { allServices } from '../data/allServices.js';
import { plans, planFeatures } from '../data/pricingPlans.js';
import { allFAQs } from '../data/allFAQs.js';
import { allTestimonials } from '../data/allTestimonials.js';
import { allTasks } from '../data/tasks.js';
import { invoices } from '../data/invoices.js';
import { teammembers } from '../data/teammembers.js';
import { activityLogs } from '../data/activityLogs.js';
import { mockNotifications } from '../data/notifications.js';

async function seed() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await BlogPost.deleteMany({});
        await Service.deleteMany({});
        await PricingPlan.deleteMany({});
        await FAQ.deleteMany({});
        await Testimonial.deleteMany({});
        await Task.deleteMany({});
        await Invoice.deleteMany({});
        await TeamMember.deleteMany({});
        await ActivityLog.deleteMany({});
        await Notification.deleteMany({});

        console.log('Cleared existing data');

        // Add a Super Admin
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'superadmin@fakhriit.com',
            role: 'super-admin',
            permissions: ['read', 'write', 'manage_clients', 'manage_teams', 'manage_admins'],
            status: 'active'
        });

        // Seed Admins
        const managerMap = {};
        for (const admin of admins) {
            const createdAdmin = await User.create({
                name: admin.name,
                email: admin.email,
                role: 'admin',
                adminRole: admin.role,
                team: admin.team,
                teamId: admin.teamId,
                phone: admin.phone,
                status: admin.status === 'active' ? 'active' : 'disabled',
                permissions: admin.permissions,
                performance: admin.performance,
                joinedDate: admin.joinedDate ? new Date(admin.joinedDate) : new Date()
            });
            managerMap[admin.name] = createdAdmin._id;
            managerMap[admin.id] = createdAdmin._id; // Map by legacy ID too
        }
        console.log(`Seeded ${admins.length + 1} users (1 Super Admin, ${admins.length} Admins)`);

        // Seed Clients
        const clientMap = {};
        for (const client of clients) {
            const createdClient = await User.create({
                name: client.name,
                email: client.email,
                role: 'client',
                company: client.company,
                phone: client.phone,
                plan: client.plan,
                status: client.status,
                manager: client.manager,
                managerId: managerMap[client.manager] || null,
                salesManager: client.salesManager,
                spCentralRequestId: client.spCentralRequestId,
                marketplace: client.marketplace,
                userPermission: client.userPermission,
                accountAccessUrl: client.accountAccessUrl,
                leadSource: client.leadSource,
                listingManager: client.listingManager,
                location: client.location,
                joinedDate: client.joinedDate ? new Date(client.joinedDate) : new Date()
            });
            clientMap[client.id] = createdClient._id;
            clientMap[client.name] = createdClient._id;
        }
        console.log(`Seeded ${clients.length} clients`);

        // Seed BlogPosts
        await BlogPost.insertMany(allBlogPosts.map(post => ({
            ...post,
            id: undefined, // remove legacy id
            status: 'published'
        })));
        console.log(`Seeded ${allBlogPosts.length} blog posts`);

        // Seed Services
        await Service.insertMany(allServices.map(service => ({
            ...service,
            serviceId: service.id,
            id: undefined
        })));
        console.log(`Seeded ${allServices.length} services`);

        // Seed PricingPlans
        await PricingPlan.insertMany(plans.map(plan => ({
            ...plan,
            planId: plan.id,
            id: undefined,
            features: planFeatures.map(f => ({
                text: f.text,
                value: f.values[plan.id],
                included: f.included.includes(plan.id)
            }))
        })));
        console.log(`Seeded ${plans.length} pricing plans`);

        // Seed FAQs
        await FAQ.insertMany(allFAQs.map(faq => {
            const category = faq.categories.home ? 'home' : (faq.categories.pricing ? 'pricing' : 'dashboard');
            return {
                question: faq.question,
                answer: faq.answer,
                category,
                order: 0
            };
        }));
        console.log(`Seeded ${allFAQs.length} FAQs`);

        // Seed Testimonials
        await Testimonial.insertMany(allTestimonials.map(t => ({
            name: t.author.name,
            role: t.author.role || t.author.handle,
            company: t.author.company,
            image: t.author.image,
            content: t.content,
            rating: t.rating,
            category: t.category
        })));
        console.log(`Seeded ${allTestimonials.length} testimonials`);

        // Seed Tasks
        await Task.insertMany(allTasks.map(task => ({
            ...task,
            taskId: task.id.toString(),
            id: undefined,
            client: {
                name: task.client,
                id: clientMap[task.clientId]
            },
            assignee: {
                name: task.owner,
                id: managerMap[task.managerId] || managerMap[task.owner]
            },
            status: task.status === 'in-progress' ? 'In Progress' : (task.status === 'completed' ? 'Completed' : 'To Do')
        })));
        console.log(`Seeded ${allTasks.length} tasks`);

        // Seed Invoices
        await Invoice.insertMany(invoices.map(inv => ({
            invoiceNumber: inv.id,
            client: {
                name: inv.client,
                id: clientMap[inv.clientId]
            },
            amount: inv.amount,
            status: inv.status === 'paid' ? 'Paid' : 'Pending',
            date: inv.date,
            dueDate: inv.dueDate,
            // legacy items not in data/invoices.js, adding placeholder
            items: [{ description: `${inv.plan} Subscription`, qty: 1, price: inv.amount, total: inv.amount }]
        })));
        console.log(`Seeded ${invoices.length} invoices`);

        // Seed TeamMembers
        await TeamMember.insertMany(teammembers.map(tm => ({
            ...tm,
            id: undefined,
            category: tm.category === 'Core Leadership' ? 'Leadership Team' : tm.category
        })));
        console.log(`Seeded ${teammembers.length} team members`);

        // Seed ActivityLogs
        await ActivityLog.insertMany(activityLogs.map(log => ({
            user: {
                name: log.user,
                id: managerMap[log.adminId]
            },
            action: log.action,
            target: log.task,
            details: `Task ID: ${log.taskId}`,
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
            type: log.type === 'task' ? 'user' : log.type
        })));
        console.log(`Seeded ${activityLogs.length} activity logs`);

        // Seed Notifications
        const superAdminNotifs = mockNotifications.superAdmin.map(n => ({
            recipientId: superAdmin._id,
            title: n.title,
            message: n.message,
            type: n.type === 'alert' ? 'warning' : (n.type === 'info' ? 'info' : 'success'),
            read: n.isRead,
            link: n.actionUrl
        }));

        await Notification.insertMany(superAdminNotifs);
        console.log(`Seeded ${superAdminNotifs.length} notifications`);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
