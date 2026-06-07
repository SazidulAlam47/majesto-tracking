// src/app/api/users/[id]/token/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requireAdmin } from '@/helpers/apiAuth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    user.token = undefined;
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'User session revoked successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revoke token error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
