import { NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

// GET /api/users - Get all users
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await UserController.getAll(searchParams);
}

// POST /api/users - Create new user
export async function POST(request) {
    const body = await request.json();
    return await UserController.create(body);
}
