import { ContactController } from '@/controllers/contactController';

// GET /api/contact - Get all contact messages
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await ContactController.getAll(searchParams);
}

// POST /api/contact - Submit contact form (Public)
export async function POST(request) {
    const body = await request.json();
    return await ContactController.submit(request, body);
}
