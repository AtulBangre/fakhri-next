import { UserController } from '@/controllers/userController';

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
    const { id } = await params;
    return await UserController.getById(id);
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    return await UserController.update(id, body);
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request, { params }) {
    const { id } = await params;
    return await UserController.delete(id);
}
