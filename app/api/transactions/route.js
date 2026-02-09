import { TransactionController } from '@/controllers/transactionController';

// GET /api/transactions - Get all transactions
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await TransactionController.getAll(searchParams);
}

// POST /api/transactions - Initialize payment
export async function POST(request) {
    const body = await request.json();
    return await TransactionController.initializePayment(body);
}
