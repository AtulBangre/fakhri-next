'use server';

import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function getInvoices({
    page = 1,
    limit = 10,
    status = '',
    clientId = null,
    search = ''
} = {}) {
    await connectDB();
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (clientId) query['client.id'] = clientId;

    if (search) {
        query.$or = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { 'client.name': { $regex: search, $options: 'i' } },
            { 'client.company': { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Invoice.countDocuments(query);

        return {
            invoices: JSON.parse(JSON.stringify(invoices)),
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { invoices: [], total: 0, pages: 0, error: 'Failed to fetch invoices' };
    }
}

export async function getInvoiceSummary(clientId) {
    await connectDB();
    try {
        const query = clientId ? { 'client.id': clientId } : {};
        const invoices = await Invoice.find(query).lean();

        const totalAmount = invoices.reduce((sum, inv) => {
            const val = parseFloat(inv.amount.replace(/[^0-9.]/g, ''));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
        const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;

        return {
            totalAmount: totalAmount,
            count: invoices.length,
            paidCount,
            pendingCount
        };
    } catch (error) {
        console.error('Error calculating invoice summary:', error);
        return null;
    }
}

export async function createInvoice(invoiceData) {
    await connectDB();
    try {
        // Generate a simple invoice number if not provided
        if (!invoiceData.invoiceNumber) {
            const count = await Invoice.countDocuments();
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            invoiceData.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
        }

        const newInvoice = await Invoice.create(invoiceData);
        return { success: true, invoice: JSON.parse(JSON.stringify(newInvoice)) };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { success: false, error: 'Failed to create invoice' };
    }
}
