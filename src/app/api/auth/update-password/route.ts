// src/app/api/auth/update-password/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { hashPassword, comparePassword } from '@/helpers/auth';
import { requireAdmin } from '@/helpers/apiAuth';
import { updatePasswordSchema } from '@/schemas/auth';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const parsed = updatePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const admin = await User.findById(authResult.user.id).select('+password');

    if (!admin) {
      return Response.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const isCurrentValid = await comparePassword(
      currentPassword,
      admin.password || ''
    );

    if (!isCurrentValid) {
      return Response.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    admin.password = await hashPassword(newPassword);
    await admin.save();

    return Response.json(
      {
        success: true,
        message: 'Password updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update password error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
