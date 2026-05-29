// src/app/api/users/[id]/approve/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requireAdmin } from '@/helpers/apiAuth';
import { signToken } from '@/helpers/jwt';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authResult = requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      name: user.name,
      type: 'user',
    });

    user.status = 'approved';
    user.token = token;
    await user.save();

    return Response.json(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          status: user.status,
        },
        message: 'User approved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approve user error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
