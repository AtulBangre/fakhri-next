import { TaskController } from '@/controllers/taskController';

// GET /api/tasks - Get all tasks
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await TaskController.getAll(searchParams);
}

// POST /api/tasks - Create new task
export async function POST(request) {
    const body = await request.json();
    return await TaskController.create(body);
}
