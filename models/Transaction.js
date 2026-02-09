import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Payment gateway details
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'cash', 'other'],
        default: 'razorpay',
    },
    gatewayTransactionId: String, // razorpay_payment_id
    gatewayOrderId: String, // razorpay_order_id
    gatewaySignature: String, // razorpay_signature
    // Amount details
    amount: {
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
        enum: ['initiated', 'pending', 'success', 'failed', 'refunded', 'partially_refunded'],
        default: 'initiated',
    },
    // Payment method
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'bank_transfer', 'other'],
    },
    paymentMethodDetails: {
        cardBrand: String,
        cardLast4: String,
        cardExpiry: String,
        bankName: String,
        upiId: String,
        walletName: String,
    },
    // Refund details
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundReason: String,
    refundId: String,
    refundDate: Date,
    // Error details
    errorCode: String,
    errorDescription: String,
    // Metadata
    ipAddress: String,
    userAgent: String,
    // Dates
    initiatedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
    // Additional notes
    notes: String,
}, {
    timestamps: true,
});

// Indexes

TransactionSchema.index({ order: 1 });
TransactionSchema.index({ user: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ paymentGateway: 1 });
TransactionSchema.index({ gatewayTransactionId: 1 });
TransactionSchema.index({ initiatedAt: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
