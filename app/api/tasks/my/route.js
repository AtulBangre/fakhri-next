import { TaskController } from '@/controllers/taskController';

// GET /api/tasks/my - Get current user's tasks
export async function GET() {
    return await TaskController.getMyTasks();
}
