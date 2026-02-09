import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import Task from '../models/Task.js';
import Invoice from '../models/Invoice.js';
import Note from '../models/Note.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import Service from '../models/Service.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Helper function to generate IDs
const generateId = (prefix, num) => `${prefix}-${num.toString().padStart(6, '0')}`;

// Seed data
async function seedDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Plan.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Transaction.deleteMany({}),
            Task.deleteMany({}),
            Invoice.deleteMany({}),
            Note.deleteMany({}),
            File.deleteMany({}),
            Notification.deleteMany({}),
            Service.deleteMany({}),
        ]);
        console.log('✅ Cleared existing data');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // ============================================
        // 1. SEED PLANS
        // ============================================
        console.log('📦 Seeding Plans...');
        const plansData = [
            {
                planId: 'elite',
                name: 'Elite',
                subtitle: 'Starter Package',
                price: 15000,
                currency: '₹',
                period: '/month',
                description: 'Best for new sellers getting started on Amazon.',
                highlighted: false,
                sortOrder: 1,
                features: [
                    { text: 'Listing/ Cataloging', value: 'Up To 100', included: true },
                    { text: 'GTIN / Brand / Category Approvals', value: true, included: true },
                    { text: 'Listing Optimization', value: true, included: true },
                    { text: 'Order Management', value: true, included: true },
                    { text: 'Weekly Meeting', value: false, included: false },
                    { text: 'Returns Management', value: true, included: true },
                    { text: 'Safe-T Claims & A to Z Claim', value: true, included: true },
                    { text: 'Performance Management', value: 'Basic', included: true },
                    { text: 'FBA Setup & Shipments', value: true, included: true },
                    { text: 'FBA Planning', value: true, included: true },
                    { text: 'Sponsored Ad Campaigns', value: true, included: true },
                    { text: 'Display / Brand Ads', value: false, included: false },
                    { text: 'Budget Planning', value: false, included: false },
                    { text: 'Deals & Coupons', value: true, included: true },
                    { text: 'Growth Strategy', value: false, included: false },
                    { text: 'Program Access', value: false, included: false },
                    { text: 'Pricing Determination', value: true, included: true },
                    { text: 'Product Recommendations', value: false, included: false },
                    { text: 'A+ / EBC + Infographics', value: false, included: false },
                    { text: 'SEO & Keywords', value: 'Basic', included: true },
                    { text: 'Competitor Analysis', value: false, included: false },
                    { text: 'Custom Reports', value: false, included: false },
                    { text: 'M.T.R. Tax Reports & Invoices', value: true, included: true },
                    { text: 'Payment Reconciliation Report', value: false, included: false },
                    { text: 'Daily Monitoring', value: true, included: true },
                    { text: 'Priority Support', value: false, included: false },
                ],
                cta: 'Get Elite Plan',
            },
            {
                planId: 'premium',
                name: 'Premium',
                subtitle: 'Most Popular',
                price: 20000,
                currency: '₹',
                period: '/month',
                description: 'Ideal for growing brands needing comprehensive management.',
                highlighted: true,
                sortOrder: 2,
                features: [
                    { text: 'Listing/ Cataloging', value: 'Up To 500', included: true },
                    { text: 'GTIN / Brand / Category Approvals', value: true, included: true },
                    { text: 'Listing Optimization', value: true, included: true },
                    { text: 'Order Management', value: true, included: true },
                    { text: 'Weekly Meeting', value: true, included: true },
                    { text: 'Returns Management', value: true, included: true },
                    { text: 'Safe-T Claims & A to Z Claim', value: true, included: true },
                    { text: 'Performance Management', value: 'Advanced', included: true },
                    { text: 'FBA Setup & Shipments', value: true, included: true },
                    { text: 'FBA Planning', value: true, included: true },
                    { text: 'Sponsored Ad Campaigns', value: true, included: true },
                    { text: 'Display / Brand Ads', value: 'Display Ads', included: true },
                    { text: 'Budget Planning', value: true, included: true },
                    { text: 'Deals & Coupons', value: true, included: true },
                    { text: 'Growth Strategy', value: true, included: true },
                    { text: 'Program Access', value: false, included: false },
                    { text: 'Pricing Determination', value: true, included: true },
                    { text: 'Product Recommendations', value: true, included: true },
                    { text: 'A+ / EBC + Infographics', value: '5 EBC + 5 InfoGFX', included: true },
                    { text: 'SEO & Keywords', value: 'Monthly 1 Time', included: true },
                    { text: 'Competitor Analysis', value: false, included: false },
                    { text: 'Custom Reports', value: true, included: true },
                    { text: 'M.T.R. Tax Reports & Invoices', value: false, included: false },
                    { text: 'Payment Reconciliation Report', value: false, included: false },
                    { text: 'Daily Monitoring', value: true, included: true },
                    { text: 'Priority Support', value: false, included: false },
                ],
                cta: 'Get Premium Plan',
            },
            {
                planId: 'platinum',
                name: 'Platinum',
                subtitle: 'Enterprise Solution',
                price: 30000,
                currency: '₹',
                period: '/month',
                description: 'Full-service solution for high-volume sellers and large catalogs.',
                highlighted: false,
                sortOrder: 3,
                features: [
                    { text: 'Listing/ Cataloging', value: 'Up To 1000', included: true },
                    { text: 'GTIN / Brand / Category Approvals', value: true, included: true },
                    { text: 'Listing Optimization', value: true, included: true },
                    { text: 'Order Management', value: true, included: true },
                    { text: 'Weekly Meeting', value: true, included: true },
                    { text: 'Returns Management', value: true, included: true },
                    { text: 'Safe-T Claims & A to Z Claim', value: true, included: true },
                    { text: 'Performance Management', value: 'Advanced + Priority', included: true },
                    { text: 'FBA Setup & Shipments', value: true, included: true },
                    { text: 'FBA Planning', value: true, included: true },
                    { text: 'Sponsored Ad Campaigns', value: true, included: true },
                    { text: 'Display / Brand Ads', value: 'Display+Brands Ads', included: true },
                    { text: 'Budget Planning', value: true, included: true },
                    { text: 'Deals & Coupons', value: true, included: true },
                    { text: 'Growth Strategy', value: true, included: true },
                    { text: 'Program Access', value: true, included: true },
                    { text: 'Pricing Determination', value: true, included: true },
                    { text: 'Product Recommendations', value: true, included: true },
                    { text: 'A+ / EBC + Infographics', value: '10 EBC + 10 InfoGFX', included: true },
                    { text: 'SEO & Keywords', value: 'Monthly 3 Time', included: true },
                    { text: 'Competitor Analysis', value: true, included: true },
                    { text: 'Custom Reports', value: 'Advanced', included: true },
                    { text: 'M.T.R. Tax Reports & Invoices', value: true, included: true },
                    { text: 'Payment Reconciliation Report', value: true, included: true },
                    { text: 'Daily Monitoring', value: true, included: true },
                    { text: 'Priority Support', value: true, included: true },
                ],
                cta: 'Get Platinum Plan',
            },
        ];
        const plans = await Plan.insertMany(plansData);
        console.log(`✅ Created ${plans.length} plans`);

        // Create a map for easy lookup
        const planMap = {};
        plans.forEach((p) => {
            planMap[p.name] = p._id;
        });

        // ============================================
        // 2. SEED PRODUCTS (Within 2 Hours Services)
        // ============================================
        console.log('📦 Seeding Products...');
        const productsData = [
            { productId: 'apt-content-1', name: 'A+ Content Creation/product', price: 500, category: 'Content', isWithin2Hours: true },
            { productId: 'infographics', name: 'Infographics Creation/product', price: 500, category: 'Design', isWithin2Hours: true },
            { productId: 'listing-catalog', name: 'Listing Cataloging', price: 500, category: 'Catalog', isWithin2Hours: true },
            { productId: 'apt-content-2', name: 'Product Photography', price: 500, category: 'Content', isWithin2Hours: true },
            { productId: 'apt-content-3', name: 'Brand Store Design', price: 500, category: 'Design', isWithin2Hours: true },
            { productId: 'apt-content-4', name: 'Product Video Creation', price: 500, category: 'Video', isWithin2Hours: true },
            { productId: 'apt-content-5', name: 'SEO Optimization', price: 500, category: 'SEO', isWithin2Hours: true },
            { productId: 'apt-content-6', name: 'Competitor Analysis', price: 500, category: 'Analysis', isWithin2Hours: true },
            { productId: 'apt-content-7', name: 'Product Listing Audit', price: 500, category: 'Audit', isWithin2Hours: true },
        ];
        const products = await Product.insertMany(productsData);
        console.log(`✅ Created ${products.length} products`);

        // ============================================
        // 3. SEED SERVICES
        // ============================================
        console.log('📦 Seeding Services...');
        const servicesData = [
            {
                serviceId: 'account-management',
                title: 'Amazon Account Setup & Management',
                shortDescription: 'Complete account setup and ongoing management for Amazon seller success.',
                fullDescription: 'From initial account creation to day-to-day operations, we handle everything. Our expert team ensures your Amazon seller account is optimized, compliant, and positioned for growth. We manage account health, handle case logs, and keep your seller metrics in top shape.',
                icon: 'Settings',
                category: 'Account Services',
                features: [
                    'Account registration & verification',
                    'Brand registry assistance',
                    'Account health management',
                    'Case log handling',
                    'Policy compliance monitoring',
                    'Performance metric optimization',
                ],
                benefits: [
                    'Avoid costly account suspensions',
                    'Maintain excellent seller metrics',
                    'Focus on your business while we handle the details',
                    'Expert guidance on Amazon policies',
                ],
                sortOrder: 1,
            },
            {
                serviceId: 'product-listing',
                title: 'Product Listing & Optimization',
                shortDescription: 'SEO-optimized listings that convert browsers into buyers.',
                fullDescription: 'Your product listings are your digital storefront. We create compelling, keyword-rich listings that rank higher in Amazon search results and convert visitors into customers. Our optimization process includes thorough keyword research, competitor analysis, and conversion-focused copywriting.',
                icon: 'FileText',
                category: 'Listing & Content',
                features: [
                    'Keyword research & analysis',
                    'SEO-optimized titles & bullets',
                    'Compelling product descriptions',
                    'Backend search term optimization',
                    'Image requirement guidance',
                    'A/B testing recommendations',
                ],
                benefits: [
                    'Higher search rankings',
                    'Increased conversion rates',
                    'Better visibility in Amazon search',
                    'Competitive edge in your category',
                ],
                sortOrder: 2,
            },
            {
                serviceId: 'fba-operations',
                title: 'Amazon FBA Operations',
                shortDescription: 'Streamlined FBA logistics for hassle-free fulfillment.',
                fullDescription: "Leverage Amazon's world-class fulfillment network with our FBA operations expertise. We help you navigate inventory planning, shipment creation, storage optimization, and troubleshoot any FBA-related issues to ensure smooth operations.",
                icon: 'Package',
                category: 'Operations',
                features: [
                    'Shipment creation & tracking',
                    'Inventory planning & forecasting',
                    'Storage fee optimization',
                    'Removal order management',
                    'FBA fee analysis',
                    'Stranded inventory resolution',
                ],
                benefits: [
                    'Reduced storage costs',
                    'Optimized inventory levels',
                    'Faster resolution of FBA issues',
                    'Improved supply chain efficiency',
                ],
                sortOrder: 3,
            },
            {
                serviceId: 'ads-management',
                title: 'Amazon Ads Management',
                shortDescription: 'Data-driven PPC campaigns that maximize ROAS.',
                fullDescription: 'Our certified advertising specialists create and manage high-performing Amazon PPC campaigns. We use advanced strategies including Sponsored Products, Sponsored Brands, and Sponsored Display to drive traffic, increase sales, and maintain profitable advertising costs.',
                icon: 'Target',
                category: 'Growth',
                features: [
                    'Campaign strategy & setup',
                    'Keyword targeting optimization',
                    'Bid management & automation',
                    'Sponsored Products management',
                    'Sponsored Brands campaigns',
                    'Sponsored Display advertising',
                ],
                benefits: [
                    'Higher return on ad spend',
                    'Increased product visibility',
                    'Lower advertising costs',
                    'Scalable growth strategies',
                ],
                sortOrder: 4,
            },
            {
                serviceId: 'a-plus-content',
                title: 'A+ / EBC Content & Infographics',
                shortDescription: 'Premium visual content that tells your brand story.',
                fullDescription: 'Elevate your listings with stunning A+ Content (Enhanced Brand Content) and professional infographics. Our creative team designs visually compelling content that showcases your products, builds brand trust, and increases conversion rates.',
                icon: 'Image',
                category: 'Listing & Content',
                features: [
                    'A+ Content design',
                    'Brand story modules',
                    'Product comparison charts',
                    'Lifestyle imagery integration',
                    'Infographic creation',
                    'Mobile-optimized layouts',
                ],
                benefits: [
                    'Higher conversion rates',
                    'Stronger brand presence',
                    'Reduced return rates',
                    'Better customer understanding',
                ],
                sortOrder: 5,
            },
            {
                serviceId: 'reconciliation',
                title: 'Reconciliation & Finance',
                shortDescription: 'Recover lost revenue and optimize your financials.',
                fullDescription: "Don't leave money on the table. Our reconciliation services identify and recover funds from Amazon for lost inventory, damaged goods, and overcharged fees. We analyze your financial reports to ensure you're getting every dollar you deserve.",
                icon: 'DollarSign',
                category: 'Account Services',
                features: [
                    'FBA reimbursement claims',
                    'Lost inventory recovery',
                    'Damaged goods claims',
                    'Fee audit & recovery',
                    'Financial reporting',
                    'Profitability analysis',
                ],
                benefits: [
                    'Recovered lost revenue',
                    'Accurate financial picture',
                    'Reduced Amazon fees',
                    'Improved profit margins',
                ],
                sortOrder: 6,
            },
            {
                serviceId: 'growth-strategy',
                title: 'Growth Strategy & Consultation',
                shortDescription: 'Strategic guidance to scale your Amazon business.',
                fullDescription: 'Take your Amazon business to the next level with our strategic consultation services. Our experienced consultants analyze your business, identify growth opportunities, and develop actionable strategies to increase market share and profitability.',
                icon: 'TrendingUp',
                category: 'Growth',
                features: [
                    'Business analysis & audit',
                    'Market opportunity assessment',
                    'Competitive analysis',
                    'Launch strategy planning',
                    'International expansion guidance',
                    'Exit strategy consulting',
                ],
                benefits: [
                    'Clear growth roadmap',
                    'Data-driven decisions',
                    'Market expansion opportunities',
                    'Long-term business planning',
                ],
                sortOrder: 7,
            },
        ];
        const services = await Service.insertMany(servicesData);
        console.log(`✅ Created ${services.length} services`);

        // ============================================
        // 4. SEED USERS (Super Admin, Admin, Client)
        // ============================================
        console.log('👤 Seeding Users...');

        // Super Admin
        const superAdmin = await User.create({
            name: 'Kuldeep Maurya',
            email: 'kuldeepmaurya4296@gmail.com',
            password: hashedPassword,
            role: 'super-admin',
            phone: '+91 9876543210',
            status: 'active',
            company: 'Fakhri IT Services',
            notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                soundEnabled: true,
                taskUpdates: true,
                paymentAlerts: true,
                marketingNews: true,
                weeklyDigest: true,
            },
        });
        console.log('✅ Created Super Admin: kuldeepmaurya4296@gmail.com');

        // Admin
        const admin = await User.create({
            name: 'Sarah Mitchell',
            email: 'k6263638053@gmail.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+91 9876543211',
            status: 'active',
            company: 'Fakhri IT Services',
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
        console.log('✅ Created Admin: k6263638053@gmail.com');

        // Additional Admins for variety
        const admin2 = await User.create({
            name: 'John Anderson',
            email: 'john.anderson@fakhriit.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+91 9876543212',
            status: 'active',
            company: 'Fakhri IT Services',
        });

        const admin3 = await User.create({
            name: 'Emma Wilson',
            email: 'emma.wilson@fakhriit.com',
            password: hashedPassword,
            role: 'admin',
            phone: '+91 9876543213',
            status: 'active',
            company: 'Fakhri IT Services',
        });

        // Client
        const client = await User.create({
            name: 'Atul Bangre',
            email: '2604atulbangre@gmail.com',
            password: hashedPassword,
            role: 'client',
            phone: '+91 9876543214',
            status: 'active',
            company: 'TechGadgets Co',
            plan: planMap['Premium'],
            planName: 'Premium',
            planStartDate: new Date('2025-12-15'),
            planEndDate: new Date('2026-03-15'),
            manager: admin._id,
            managerName: 'Sarah Mitchell',
            salesManager: 'David Sales',
            marketplace: 'Amazon India',
            userPermission: 'Full Access',
            accountAccessUrl: 'https://sellercentral.amazon.in',
            leadSource: 'LinkedIn',
            listingManager: 'Emily Listings',
            activeTasks: 3,
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
        console.log('✅ Created Client: 2604atulbangre@gmail.com');

        // Additional Clients
        const client2 = await User.create({
            name: 'Emily Smith',
            email: 'emily@beautybrand.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 234-5678',
            status: 'active',
            company: 'BeautyBrand Inc',
            plan: planMap['Platinum'],
            planName: 'Platinum',
            planStartDate: new Date('2025-11-20'),
            planEndDate: new Date('2026-02-20'),
            manager: admin._id,
            managerName: 'Sarah Mitchell',
            activeTasks: 2,
        });

        const client3 = await User.create({
            name: 'Michael Brown',
            email: 'michael@homeessentials.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 345-6789',
            status: 'active',
            company: 'HomeEssentials',
            plan: planMap['Elite'],
            planName: 'Elite',
            planStartDate: new Date('2026-01-10'),
            planEndDate: new Date('2026-04-10'),
            manager: admin._id,
            managerName: 'Sarah Mitchell',
            activeTasks: 1,
        });

        const client4 = await User.create({
            name: 'Lisa Chen',
            email: 'lisa@fashion.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 456-7890',
            status: 'pending',
            company: 'Fashion Forward',
            plan: planMap['Platinum'],
            planName: 'Platinum',
            planStartDate: new Date('2026-01-19'),
            planEndDate: new Date('2026-04-19'),
            managerName: 'Unassigned',
            activeTasks: 0,
        });

        const client5 = await User.create({
            name: 'Robert Kim',
            email: 'robert@tech.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 567-8901',
            status: 'active',
            company: 'Tech Innovators',
            plan: planMap['Elite'],
            planName: 'Elite',
            planStartDate: new Date('2026-01-18'),
            planEndDate: new Date('2026-04-18'),
            manager: admin2._id,
            managerName: 'John Anderson',
            activeTasks: 2,
        });

        const client6 = await User.create({
            name: 'Amanda White',
            email: 'amanda@sports.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 678-9012',
            status: 'active',
            company: 'Sports Gear Pro',
            plan: planMap['Premium'],
            planName: 'Premium',
            planStartDate: new Date('2026-01-05'),
            planEndDate: new Date('2026-04-05'),
            manager: admin3._id,
            managerName: 'Emma Wilson',
            activeTasks: 1,
        });

        const client7 = await User.create({
            name: 'Alex Turner',
            email: 'alex@digitalgoods.com',
            password: hashedPassword,
            role: 'client',
            phone: '+1 (555) 789-0123',
            status: 'active',
            company: 'Digital Goods LLC',
            plan: planMap['Premium'],
            planName: 'Premium',
            planStartDate: new Date('2026-01-20'),
            planEndDate: new Date('2026-04-20'),
            manager: admin._id,
            managerName: 'Sarah Mitchell',
            activeTasks: 2,
        });

        // Update admin assigned clients
        await User.findByIdAndUpdate(admin._id, {
            assignedClients: [client._id, client2._id, client3._id, client7._id],
        });
        await User.findByIdAndUpdate(admin2._id, {
            assignedClients: [client5._id],
        });
        await User.findByIdAndUpdate(admin3._id, {
            assignedClients: [client6._id],
        });

        console.log('✅ Created additional clients');

        // ============================================
        // 5. SEED ORDERS
        // ============================================
        console.log('📦 Seeding Orders...');
        const ordersData = [
            {
                orderId: generateId('ORD', 1),
                user: client._id,
                type: 'subscription',
                plan: planMap['Premium'],
                planName: 'Premium',
                planDuration: 3,
                subtotal: 60000,
                tax: 10800,
                total: 70800,
                status: 'completed',
                paymentStatus: 'paid',
                orderDate: new Date('2025-12-15'),
                completedDate: new Date('2025-12-15'),
                subscriptionStartDate: new Date('2025-12-15'),
                subscriptionEndDate: new Date('2026-03-15'),
                billingAddress: {
                    name: 'Atul Bangre',
                    email: '2604atulbangre@gmail.com',
                    phone: '+91 9876543214',
                    address: '123 Business Park',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India',
                },
            },
            {
                orderId: generateId('ORD', 2),
                user: client2._id,
                type: 'subscription',
                plan: planMap['Platinum'],
                planName: 'Platinum',
                planDuration: 3,
                subtotal: 90000,
                tax: 16200,
                total: 106200,
                status: 'completed',
                paymentStatus: 'paid',
                orderDate: new Date('2025-11-20'),
                completedDate: new Date('2025-11-20'),
                subscriptionStartDate: new Date('2025-11-20'),
                subscriptionEndDate: new Date('2026-02-20'),
                billingAddress: {
                    name: 'Emily Smith',
                    email: 'emily@beautybrand.com',
                    phone: '+1 (555) 234-5678',
                },
            },
            {
                orderId: generateId('ORD', 3),
                user: client3._id,
                type: 'subscription',
                plan: planMap['Elite'],
                planName: 'Elite',
                planDuration: 3,
                subtotal: 45000,
                tax: 8100,
                total: 53100,
                status: 'completed',
                paymentStatus: 'paid',
                orderDate: new Date('2026-01-10'),
                completedDate: new Date('2026-01-10'),
                subscriptionStartDate: new Date('2026-01-10'),
                subscriptionEndDate: new Date('2026-04-10'),
                billingAddress: {
                    name: 'Michael Brown',
                    email: 'michael@homeessentials.com',
                    phone: '+1 (555) 345-6789',
                },
            },
        ];
        const orders = await Order.insertMany(ordersData);
        console.log(`✅ Created ${orders.length} orders`);

        // ============================================
        // 6. SEED TRANSACTIONS
        // ============================================
        console.log('💳 Seeding Transactions...');
        const transactionsData = [
            {
                transactionId: generateId('TXN', 1),
                order: orders[0]._id,
                user: client._id,
                paymentGateway: 'razorpay',
                gatewayTransactionId: 'pay_Ixyz1234567890',
                gatewayOrderId: 'order_Ixyz1234567890',
                amount: 70800,
                status: 'success',
                paymentMethod: 'card',
                paymentMethodDetails: {
                    cardBrand: 'VISA',
                    cardLast4: '4242',
                    cardExpiry: '12/2027',
                },
                initiatedAt: new Date('2025-12-15T10:00:00'),
                completedAt: new Date('2025-12-15T10:00:30'),
            },
            {
                transactionId: generateId('TXN', 2),
                order: orders[1]._id,
                user: client2._id,
                paymentGateway: 'razorpay',
                gatewayTransactionId: 'pay_Ixyz1234567891',
                gatewayOrderId: 'order_Ixyz1234567891',
                amount: 106200,
                status: 'success',
                paymentMethod: 'upi',
                paymentMethodDetails: {
                    upiId: 'emily@okicici',
                },
                initiatedAt: new Date('2025-11-20T14:00:00'),
                completedAt: new Date('2025-11-20T14:01:00'),
            },
            {
                transactionId: generateId('TXN', 3),
                order: orders[2]._id,
                user: client3._id,
                paymentGateway: 'razorpay',
                gatewayTransactionId: 'pay_Ixyz1234567892',
                gatewayOrderId: 'order_Ixyz1234567892',
                amount: 53100,
                status: 'success',
                paymentMethod: 'netbanking',
                paymentMethodDetails: {
                    bankName: 'HDFC Bank',
                },
                initiatedAt: new Date('2026-01-10T09:00:00'),
                completedAt: new Date('2026-01-10T09:02:00'),
            },
        ];
        const transactions = await Transaction.insertMany(transactionsData);
        console.log(`✅ Created ${transactions.length} transactions`);

        // ============================================
        // 7. SEED TASKS
        // ============================================
        console.log('📋 Seeding Tasks...');
        const tasksData = [
            {
                taskId: generateId('TSK', 1),
                title: 'PPC Campaign Setup',
                description: 'Set up and optimize PPC campaigns for product launch',
                client: client._id,
                clientName: 'Atul Bangre',
                assignedTo: admin._id,
                assignedToName: 'Sarah Mitchell',
                service: 'PPC Management',
                priority: 'High',
                status: 'in-progress',
                dueDate: new Date('2026-01-25'),
                eta: 'Jan 25, 2026',
                planForWeek: '6',
                isHighPriority: true,
                progressPercentage: 45,
                lastUpdated: '2 hours ago',
            },
            {
                taskId: generateId('TSK', 2),
                title: 'Listing Optimization - Product A',
                description: 'Optimize product listings for better visibility',
                client: client._id,
                clientName: 'Atul Bangre',
                assignedTo: admin._id,
                assignedToName: 'Sarah Mitchell',
                service: 'Catalog Management',
                priority: 'Medium',
                status: 'completed',
                dueDate: new Date('2026-01-20'),
                completedDate: new Date('2026-01-19'),
                eta: 'Jan 20, 2026',
                planForWeek: '5',
                isCompleted: true,
                progressPercentage: 100,
                lastUpdated: '2 days ago',
            },
            {
                taskId: generateId('TSK', 3),
                title: 'A+ Content Design - Product B',
                description: 'Design A+ content for product B',
                client: client2._id,
                clientName: 'Emily Smith',
                assignedTo: admin._id,
                assignedToName: 'Sarah Mitchell',
                service: 'A+ Content',
                priority: 'Medium',
                status: 'in-progress',
                dueDate: new Date('2026-01-28'),
                eta: 'Jan 28, 2026',
                planForWeek: '7',
                progressPercentage: 30,
                lastUpdated: '5 hours ago',
            },
            {
                taskId: generateId('TSK', 4),
                title: 'Brand Registry Application',
                description: 'Apply for Amazon Brand Registry',
                client: client3._id,
                clientName: 'Michael Brown',
                assignedTo: admin2._id,
                assignedToName: 'John Anderson',
                service: 'Brand Registry',
                priority: 'High',
                status: 'pending',
                dueDate: new Date('2026-02-01'),
                eta: 'Feb 1, 2026',
                planForWeek: '6',
                isHighPriority: true,
                progressPercentage: 0,
                lastUpdated: '1 day ago',
            },
            {
                taskId: generateId('TSK', 5),
                title: 'Competitor Analysis Report',
                description: 'Analyze top competitors and provide recommendations',
                client: client._id,
                clientName: 'Atul Bangre',
                assignedTo: admin._id,
                assignedToName: 'Sarah Mitchell',
                service: 'Account Management',
                priority: 'Low',
                status: 'completed',
                dueDate: new Date('2026-01-14'),
                completedDate: new Date('2026-01-14'),
                eta: 'Jan 14, 2026',
                planForWeek: '3',
                isCompleted: true,
                progressPercentage: 100,
                lastUpdated: '5 days ago',
            },
            {
                taskId: generateId('TSK', 6),
                title: 'Backend Search Terms Update',
                description: 'Update backend search terms for all products',
                client: client2._id,
                clientName: 'Emily Smith',
                assignedTo: admin._id,
                assignedToName: 'Sarah Mitchell',
                service: 'Catalog Management',
                priority: 'Medium',
                status: 'completed',
                dueDate: new Date('2026-01-12'),
                completedDate: new Date('2026-01-12'),
                eta: 'Jan 12, 2026',
                planForWeek: '4',
                isCompleted: true,
                progressPercentage: 100,
                lastUpdated: '7 days ago',
            },
            {
                taskId: generateId('TSK', 7),
                title: 'Listing Optimization',
                description: 'Optimize product listings',
                client: client5._id,
                clientName: 'Robert Kim',
                assignedTo: admin2._id,
                assignedToName: 'John Anderson',
                service: 'Catalog',
                priority: 'Low',
                status: 'completed',
                dueDate: new Date('2026-01-20'),
                completedDate: new Date('2026-01-19'),
                eta: 'Jan 20, 2026',
                isCompleted: true,
                progressPercentage: 100,
                lastUpdated: '2 days ago',
            },
            {
                taskId: generateId('TSK', 8),
                title: 'Account Audit',
                description: 'Perform comprehensive account audit',
                client: client6._id,
                clientName: 'Amanda White',
                assignedTo: admin3._id,
                assignedToName: 'Emma Wilson',
                service: 'Account Management',
                priority: 'Medium',
                status: 'completed',
                dueDate: new Date('2026-01-18'),
                completedDate: new Date('2026-01-17'),
                eta: 'Jan 18, 2026',
                isCompleted: true,
                progressPercentage: 100,
                lastUpdated: '4 days ago',
            },
        ];
        const tasks = await Task.insertMany(tasksData);
        console.log(`✅ Created ${tasks.length} tasks`);

        // ============================================
        // 8. SEED INVOICES
        // ============================================
        console.log('📄 Seeding Invoices...');
        const invoicesData = [
            {
                invoiceId: generateId('INV', 1),
                invoiceNumber: 'INV-2026-001',
                user: client._id,
                order: orders[0]._id,
                transaction: transactions[0]._id,
                items: [
                    { description: 'Premium Plan - 3 Months', quantity: 1, rate: 60000, amount: 60000 },
                ],
                subtotal: 60000,
                tax: 10800,
                taxRate: 18,
                total: 70800,
                status: 'paid',
                invoiceDate: new Date('2026-01-15'),
                dueDate: new Date('2026-01-15'),
                paidDate: new Date('2026-01-15'),
                billingFrom: {
                    name: 'Fakhri IT Services',
                    address: '123 Business Center, Mumbai',
                    email: 'billing@fakhriit.com',
                    phone: '+91 9876543210',
                    gstin: '27AABCF1234Q1ZV',
                },
                billingTo: {
                    name: 'Atul Bangre',
                    company: 'TechGadgets Co',
                    email: '2604atulbangre@gmail.com',
                    phone: '+91 9876543214',
                },
            },
            {
                invoiceId: generateId('INV', 2),
                invoiceNumber: 'INV-2025-012',
                user: client._id,
                items: [
                    { description: 'Premium Plan - Monthly', quantity: 1, rate: 20000, amount: 20000 },
                ],
                subtotal: 20000,
                tax: 3600,
                taxRate: 18,
                total: 23600,
                status: 'paid',
                invoiceDate: new Date('2025-12-15'),
                dueDate: new Date('2025-12-15'),
                paidDate: new Date('2025-12-15'),
                billingFrom: {
                    name: 'Fakhri IT Services',
                    address: '123 Business Center, Mumbai',
                    email: 'billing@fakhriit.com',
                },
                billingTo: {
                    name: 'Atul Bangre',
                    company: 'TechGadgets Co',
                    email: '2604atulbangre@gmail.com',
                },
            },
            {
                invoiceId: generateId('INV', 3),
                invoiceNumber: 'INV-2025-011',
                user: client._id,
                items: [
                    { description: 'Premium Plan - Monthly', quantity: 1, rate: 20000, amount: 20000 },
                ],
                subtotal: 20000,
                tax: 3600,
                taxRate: 18,
                total: 23600,
                status: 'paid',
                invoiceDate: new Date('2025-11-15'),
                dueDate: new Date('2025-11-15'),
                paidDate: new Date('2025-11-15'),
                billingFrom: {
                    name: 'Fakhri IT Services',
                },
                billingTo: {
                    name: 'Atul Bangre',
                    company: 'TechGadgets Co',
                },
            },
        ];
        const invoices = await Invoice.insertMany(invoicesData);
        console.log(`✅ Created ${invoices.length} invoices`);

        // ============================================
        // 9. SEED NOTES
        // ============================================
        console.log('📝 Seeding Notes...');
        const notesData = [
            {
                noteId: generateId('NTE', 1),
                client: client._id,
                author: admin._id,
                authorName: 'Sarah Mitchell',
                content: 'Client requested priority on PPC campaigns. Discussed budget allocation for Q1.',
                type: 'meeting',
            },
            {
                noteId: generateId('NTE', 2),
                client: client._id,
                author: admin2._id,
                authorName: 'John Anderson',
                content: 'Completed initial consultation. Client has 50 SKUs to optimize.',
                type: 'general',
            },
            {
                noteId: generateId('NTE', 3),
                client: client2._id,
                author: admin._id,
                authorName: 'Sarah Mitchell',
                content: 'Client wants focus on beauty category. Seasonal campaigns discussed.',
                type: 'meeting',
            },
            {
                noteId: generateId('NTE', 4),
                client: client3._id,
                author: admin3._id,
                authorName: 'Emma Wilson',
                content: 'Brand registry documents received. Processing application.',
                type: 'general',
            },
        ];
        const notes = await Note.insertMany(notesData);
        console.log(`✅ Created ${notes.length} notes`);

        // ============================================
        // 10. SEED FILES
        // ============================================
        console.log('📁 Seeding Files...');
        const filesData = [
            {
                fileId: generateId('FLE', 1),
                name: 'Product A - A+ Content Final.pdf',
                client: client._id,
                clientName: 'Atul Bangre',
                uploadedBy: admin._id,
                uploadedByName: 'Sarah Mitchell',
                type: 'pdf',
                size: '2.4 MB',
                sizeBytes: 2516582,
                version: 'v2.0',
            },
            {
                fileId: generateId('FLE', 2),
                name: 'PPC Campaign Report - Week 3.xlsx',
                client: client._id,
                clientName: 'Atul Bangre',
                uploadedBy: admin._id,
                uploadedByName: 'Sarah Mitchell',
                type: 'excel',
                size: '856 KB',
                sizeBytes: 876544,
                version: 'v1.0',
            },
            {
                fileId: generateId('FLE', 3),
                name: 'Product Images - Main.zip',
                client: client2._id,
                clientName: 'Emily Smith',
                uploadedBy: admin._id,
                uploadedByName: 'Design Team',
                type: 'zip',
                size: '15.2 MB',
                sizeBytes: 15938355,
                version: 'v2.0',
            },
            {
                fileId: generateId('FLE', 4),
                name: 'Competitor Analysis Report.pdf',
                client: client._id,
                clientName: 'Atul Bangre',
                uploadedBy: admin._id,
                uploadedByName: 'Sarah Mitchell',
                type: 'pdf',
                size: '1.8 MB',
                sizeBytes: 1887436,
                version: 'v1.0',
            },
            {
                fileId: generateId('FLE', 5),
                name: 'Brand Guidelines.pdf',
                client: client2._id,
                clientName: 'Emily Smith',
                uploadedBy: admin._id,
                uploadedByName: 'Design Team',
                type: 'pdf',
                size: '4.2 MB',
                sizeBytes: 4404019,
                version: 'v1.0',
            },
        ];
        const files = await File.insertMany(filesData);
        console.log(`✅ Created ${files.length} files`);

        // ============================================
        // 11. SEED NOTIFICATIONS
        // ============================================
        console.log('🔔 Seeding Notifications...');
        const notificationsData = [
            // Super Admin notifications
            {
                notificationId: generateId('NTF', 1),
                user: superAdmin._id,
                type: 'alert',
                title: 'New Client Registration',
                message: 'TechCorp Inc. has registered and is pending approval',
                icon: 'UserPlus',
                actionUrl: '#clients',
                isRead: false,
                category: 'client',
                time: '2 min ago',
            },
            {
                notificationId: generateId('NTF', 2),
                user: superAdmin._id,
                type: 'success',
                title: 'Payment Received',
                message: 'Invoice #INV-2024-089 paid by GlobalMart',
                icon: 'DollarSign',
                actionUrl: '#sales',
                isRead: false,
                category: 'payment',
                time: '15 min ago',
            },
            {
                notificationId: generateId('NTF', 3),
                user: superAdmin._id,
                type: 'warning',
                title: 'Server Alert',
                message: 'High CPU usage detected on production server',
                icon: 'AlertTriangle',
                actionUrl: '#settings',
                isRead: false,
                category: 'system',
                time: '1 hour ago',
            },
            // Admin notifications
            {
                notificationId: generateId('NTF', 4),
                user: admin._id,
                type: 'alert',
                title: 'New Task Assigned',
                message: 'PPC Campaign optimization for TechCorp Inc.',
                icon: 'ClipboardList',
                actionUrl: '#tasks',
                isRead: false,
                category: 'task',
                time: '5 min ago',
            },
            {
                notificationId: generateId('NTF', 5),
                user: admin._id,
                type: 'info',
                title: 'Client Message',
                message: 'GlobalMart sent a new message regarding their campaign',
                icon: 'MessageSquare',
                actionUrl: '#clients',
                isRead: false,
                category: 'client',
                time: '30 min ago',
            },
            // Client notifications
            {
                notificationId: generateId('NTF', 6),
                user: client._id,
                type: 'success',
                title: 'Report Ready',
                message: 'Your monthly performance report is now available',
                icon: 'FileText',
                actionUrl: '#files',
                isRead: false,
                category: 'general',
                time: '10 min ago',
            },
            {
                notificationId: generateId('NTF', 7),
                user: client._id,
                type: 'info',
                title: 'Task Update',
                message: 'Listing optimization for Product X is in progress',
                icon: 'RefreshCw',
                actionUrl: '#tasks',
                isRead: false,
                category: 'task',
                time: '1 hour ago',
            },
            {
                notificationId: generateId('NTF', 8),
                user: client._id,
                type: 'alert',
                title: 'Invoice Due',
                message: 'Invoice #INV-2024-090 is due in 3 days',
                icon: 'CreditCard',
                actionUrl: '#billing',
                isRead: true,
                category: 'payment',
                time: '2 hours ago',
            },
        ];
        const notifications = await Notification.insertMany(notificationsData);
        console.log(`✅ Created ${notifications.length} notifications`);

        // ============================================
        // DONE!
        // ============================================
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Plans: ${plans.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Services: ${services.length}`);
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Orders: ${orders.length}`);
        console.log(`   - Transactions: ${transactions.length}`);
        console.log(`   - Tasks: ${tasks.length}`);
        console.log(`   - Invoices: ${invoices.length}`);
        console.log(`   - Notes: ${notes.length}`);
        console.log(`   - Files: ${files.length}`);
        console.log(`   - Notifications: ${notifications.length}`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Super Admin: kuldeepmaurya4296@gmail.com / 123456');
        console.log('   Admin: k6263638053@gmail.com / 123456');
        console.log('   Client: 2604atulbangre@gmail.com / 123456');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();
