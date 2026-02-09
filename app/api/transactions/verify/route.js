import { TransactionController } from '@/controllers/transactionController';

// POST /api/transactions/verify - Verify payment (Razorpay callback)
export async function POST(request) {
    const body = await request.json();
    return await TransactionController.verifyPayment(body);
}
