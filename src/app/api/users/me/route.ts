// src/app/api/users/me/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requireAuth } from '@/helpers/apiAuth';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { user } = authResult;

    if (user.type === 'admin') {
      return Response.json(
        { success: false, error: 'Admins cannot delete themselves this way' },
        { status: 403 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(user.id);

    if (!deletedUser) {
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
    console.error('Delete self error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
