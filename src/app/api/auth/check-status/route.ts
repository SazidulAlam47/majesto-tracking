// src/app/api/auth/check-status/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const signature = request.nextUrl.searchParams.get('signature');

    if (!signature) {
      return Response.json(
        { success: false, error: 'Signature query parameter is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ signature });

    if (!user) {
      return Response.json(
        {
          success: true,
          data: { status: 'not_found' },
          message: 'No request found for this device',
        },
        { status: 404 }
      );
    }

    if (user.status === 'approved' && user.token) {
      // Set cookie server-side
      (await cookies()).set('user_token', user.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      return Response.json(
        {
          success: true,
          data: { status: 'approved', token: user.token },
          message: 'Access approved',
        },
        { status: 200 }
      );
    }

    if (user.status === 'pending') {
      return Response.json(
        {
          success: true,
          data: { status: 'pending' },
          message: 'Your access request is pending approval',
        },
        { status: 200 }
      );
    }

    // Rejected
    return Response.json(
      {
        success: true,
        data: { status: 'rejected' },
        message: 'Your access request has been rejected',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check status error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
