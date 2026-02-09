import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
    description: String,
    quantity: { type: Number, default: 1 },
    rate: Number,
    amount: Number,
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        required: true,
        unique: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
    },
    // Relationships
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    },
    // Invoice details
    items: [InvoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    taxRate: {
        type: Number,
        default: 18, // GST 18%
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
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
        default: 'draft',
    },
    // Dates
    invoiceDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: Date,
    paidDate: Date,
    // Billing details
    billingFrom: {
        name: { type: String, default: 'Fakhri IT Services' },
        address: String,
        email: String,
        phone: String,
        gstin: String,
    },
    billingTo: {
        name: String,
        company: String,
        address: String,
        email: String,
        phone: String,
        gstin: String,
    },
    // Payment details
    paymentMethod: String,
    paymentTerms: String,
    // Notes
    notes: String,
    termsAndConditions: String,
    // PDF URL
    pdfUrl: String,
}, {
    timestamps: true,
});

// Indexes
InvoiceSchema.index({ invoiceId: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ user: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ dueDate: 1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
