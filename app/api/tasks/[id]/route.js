import { TaskController } from '@/controllers/taskController';

// GET /api/tasks/[id] - Get task by ID
export async function GET(request, { params }) {
    const { id } = await params;
    return await TaskController.getById(id);
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    return await TaskController.update(id, body);
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, { params }) {
    const { id } = await params;
    return await TaskController.delete(id);
}
