import { ContactController } from '@/controllers/contactController';

// GET /api/contact/[id] - Get message by ID
export async function GET(request, { params }) {
    const { id } = await params;
    return await ContactController.getById(id);
}

// PUT /api/contact/[id] - Update message status
export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    return await ContactController.updateStatus(id, body);
}
