import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    productId: String,
    name: String,
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
    price: Number,
    subtotal: Number,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Order type
    type: {
        type: String,
        enum: ['subscription', 'one-time', 'add-on', 'renewal'],
        required: true,
    },
    // For subscription orders
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
    },
    planName: String,
    planDuration: {
        type: Number, // in months
        default: 1,
    },
    // Order items (for one-time or add-on purchases)
    items: [OrderItemSchema],
    // Pricing
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    discountCode: String,
    tax: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
    },
    // Billing info
    billingAddress: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' },
        gstin: String,
    },
    // Notes
    notes: String,
    adminNotes: String,
    // Dates
    orderDate: {
        type: Date,
        default: Date.now,
    },
    completedDate: Date,
    // For subscription validity
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
}, {
    timestamps: true,
});

// Indexes

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ type: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ 'billingAddress.email': 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
