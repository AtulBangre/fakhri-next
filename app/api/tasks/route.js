import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/utils/apiResponse';
import { requireAuth, requireRole } from '@/middleware/auth';
import { validateBody, schemas } from '@/middleware/validation';

// Helper to generate task ID
const generateTaskId = async () => {
    const count = await Task.countDocuments();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `TSK-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
};

// GET /api/tasks - Get all tasks with filtering
export async function GET(request) {
    try {
        const auth = await requireAuth();
        if (!auth.authenticated) return auth.error;

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const service = searchParams.get('service');
        const clientId = searchParams.get('clientId');
        const assignedTo = searchParams.get('assignedTo');
        const isHighPriority = searchParams.get('highPriority') === 'true';

        await dbConnect();

        const query = {};

        // Role-based filtering
        if (auth.user.role === 'client') {
            query.client = auth.user.id;
        } else if (auth.user.role === 'admin') {
            query.assignedTo = auth.user.id;
        }

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (service) query.service = service;
        if (clientId) query.client = clientId;
        if (assignedTo) query.assignedTo = assignedTo;
        if (isHighPriority) query.isHighPriority = true;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate('client', 'name email company')
                .populate('assignedTo', 'name email')
                .sort({ isHighPriority: -1, dueDate: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Task.countDocuments(query),
        ]);

        // Format tasks for frontend
        const formattedTasks = tasks.map(task => ({
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            client: task.client ? {
                id: task.client._id,
                name: task.client.name,
                email: task.client.email,
                company: task.client.company,
            } : null,
            clientName: task.clientName,
            assignedTo: task.assignedTo ? {
                id: task.assignedTo._id,
                name: task.assignedTo.name,
                email: task.assignedTo.email,
            } : null,
            assignedToName: task.assignedToName,
            service: task.service,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            eta: task.eta,
            planForWeek: task.planForWeek,
            isHighPriority: task.isHighPriority,
            isCompleted: task.isCompleted,
            progressPercentage: task.progressPercentage,
            lastUpdated: task.lastUpdated,
            completedDate: task.completedDate,
            createdAt: task.createdAt,
        }));

        return NextResponse.json({
            success: true,
            data: formattedTasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        return apiError('Failed to fetch tasks', 500);
    }
}

// POST /api/tasks - Create new task
export async function POST(request) {
    try {
        const auth = await requireRole(['super-admin', 'admin']);
        if (!auth.authorized) return auth.error;

        const body = await request.json();

        // Validate input
        const validation = validateBody(body, schemas.createTask);
        if (!validation.isValid) {
            return apiError('Validation failed', 400, validation.errors);
        }

        await dbConnect();

        // Get client details
        let clientName = body.clientName;
        if (body.clientId && !clientName) {
            const client = await User.findById(body.clientId);
            if (client) {
                clientName = client.name;
            }
        }

        // Get assignee details
        let assignedToName = body.assignedToName;
        if (body.assignedTo && !assignedToName) {
            const assignee = await User.findById(body.assignedTo);
            if (assignee) {
                assignedToName = assignee.name;
            }
        }

        // Generate task ID
        const taskId = await generateTaskId();

        // Create task
        const task = await Task.create({
            taskId,
            title: validation.data.title,
            description: validation.data.description,
            client: body.clientId,
            clientName,
            assignedTo: body.assignedTo || auth.user.id,
            assignedToName: assignedToName || auth.user.name,
            service: body.service,
            priority: body.priority || 'Medium',
            status: 'pending',
            dueDate: body.dueDate,
            eta: body.eta,
            planForWeek: body.planForWeek,
            isHighPriority: body.priority === 'High' || body.isHighPriority,
            progressPercentage: 0,
            createdBy: auth.user.id,
        });

        // Update client's active tasks count
        if (body.clientId) {
            await User.findByIdAndUpdate(body.clientId, {
                $inc: { activeTasks: 1 },
            });
        }

        // Format response
        const taskResponse = {
            id: task._id,
            taskId: task.taskId,
            title: task.title,
            clientName: task.clientName,
            assignedToName: task.assignedToName,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
        };

        return apiSuccess(taskResponse, 'Task created successfully', 201);

    } catch (error) {
        console.error('Create task error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return apiError('Validation failed', 400, errors);
        }

        return apiError('Failed to create task', 500);
    }
}
