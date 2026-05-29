// src/app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requireAdmin } from '@/helpers/apiAuth';
import { updateUserSchema } from '@/schemas/user';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authResult = requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name: parsed.data.name },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: user,
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authResult = requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
