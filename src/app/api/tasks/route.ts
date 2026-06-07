// src/app/api/tasks/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/lib/models/Task';
import { requireAuth, requireAdmin } from '@/helpers/apiAuth';
import { createTaskSchema } from '@/schemas/task';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = {};

    if (from || to) {
      filter.date = {};
      if (from) {
        (filter.date as Record<string, unknown>).$gte = new Date(from);
      }
      if (to) {
        (filter.date as Record<string, unknown>).$lte = new Date(to);
      }
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return Response.json(
      {
        success: true,
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get tasks error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const task = await Task.create(parsed.data);

    return Response.json(
      {
        success: true,
        data: task,
        message: 'Task created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
