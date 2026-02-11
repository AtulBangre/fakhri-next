import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true, required: true },
    client: {
        name: { type: String },
        company: { type: String },
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    amount: { type: String },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
        default: 'Pending'
    },
    date: { type: String },
    dueDate: { type: String },
    items: [{
        description: { type: String },
        qty: { type: Number },
        price: { type: String },
        total: { type: String }
    }],
    paymentMethod: { type: String },
    downloadUrl: { type: String }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
