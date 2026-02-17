'use server';

import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { sendEmail } from '@/lib/mail';
import { createNotification } from '@/lib/actions/notification';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder({ amount, currency = "INR", receipt }) {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return { success: false, error: error.message };
    }
}

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    return isAuthentic;
}

export async function processCheckout({ userId, planId, cartItems, billingDetails, totalAmount, paymentId, orderId, signature }) {
    await connectDB();

    try {
        // Verify payment signature if provided (for online payments)
        if (paymentId && orderId && signature) {
            const isValid = await verifyPayment({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
            });

            if (!isValid) {
                throw new Error('Payment verification failed');
            }
        }

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        let invoiceItems = [];
        let newPlan = null;
        let subscribedServices = [];

        // 1. Process Plan
        if (planId) {
            // Fetch plan details (Mocking or you can fetch specifically if needed, but we assume planId is the plan name/ID)
            const PricingPlan = (await import('@/models/PricingPlan')).default;
            newPlan = planId; // e.g. 'premium'

            // Add to invoice
            invoiceItems.push({
                description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
                qty: 1,
                price: "See Total", // Simplified
                total: "See Total"
            });
        }

        // 2. Process Cart Items
        if (cartItems && cartItems.length > 0) {
            cartItems.forEach(item => {
                invoiceItems.push({
                    description: item.name,
                    qty: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                });

                subscribedServices.push({
                    serviceId: item.id || item.serviceId,
                    name: item.name,
                    price: item.price,
                    status: 'active',
                    subscribedDate: new Date()
                });
            });
        }

        // 3. Create Invoice
        const invoiceCount = await Invoice.countDocuments();
        const date = new Date();
        const year = date.getFullYear();
        const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

        const newInvoice = await Invoice.create({
            invoiceNumber,
            client: {
                name: billingDetails.name,
                id: user._id,
                email: billingDetails.email,
                company: billingDetails.company
            },
            amount: String(totalAmount),
            items: invoiceItems,
            status: 'Paid', // Mark as Paid since we verified Razorpay
            paymentId: paymentId,
            date: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // 4. Update User Profile
        const updateData = {};
        if (newPlan) {
            updateData.plan = newPlan;
        }

        if (subscribedServices.length > 0) {
            updateData.$push = { subscribedServices: { $each: subscribedServices } };
        }

        if (!user.phone && billingDetails.phone) updateData.phone = billingDetails.phone;
        if (!user.company && billingDetails.company) updateData.company = billingDetails.company;

        await User.findByIdAndUpdate(userId, updateData);

        // 5. Send Email Notification
        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await sendEmail({
            to: billingDetails.email,
            subject: `Payment Successful - Invoice ${invoiceNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4CAF50;">Payment Successful</h1>
                        <p style="color: #666;">Thank you for your purchase!</p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                        <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
                        <p><strong>Transaction ID:</strong> ${paymentId}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>

                    <p>Your subscription/services are now active. You can view your invoice and manage your services from your dashboard.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${appUrl}/client/dashboard#Billing" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
                    </div>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; font-size: 12px; color: #999;">
                        <p>Fakhri IT Services</p>
                    </div>
                </div>
            `,
            text: `Payment Successful for Invoice ${invoiceNumber}. Amount: ₹${totalAmount}. Transaction ID: ${paymentId}. View details in your dashboard.`
        });

        // 6. Create Dashboard Notification
        await createNotification({
            recipientId: userId,
            title: "Payment Successful",
            message: `Thank you! We received your payment of ₹${totalAmount} for Invoice ${invoiceNumber}.`,
            type: "success",
            link: "#Billing"
        });

        return { success: true, invoiceId: newInvoice._id.toString(), invoiceNumber };

    } catch (error) {
        console.error('Checkout error:', error);
        return { success: false, error: error.message };
    }
}
