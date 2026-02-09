import { UserController } from '@/controllers/userController';

// GET /api/users/me - Get current user profile
export async function GET() {
    return await UserController.getProfile();
}

// PUT /api/users/me - Update current user profile
export async function PUT(request) {
    const body = await request.json();
    return await UserController.updateProfile(body);
}
