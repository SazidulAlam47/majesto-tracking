// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requireAdmin } from '@/helpers/apiAuth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
