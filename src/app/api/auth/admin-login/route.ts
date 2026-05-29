// src/app/api/auth/admin-login/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { comparePassword } from '@/helpers/auth';
import { signToken } from '@/helpers/jwt';
import { adminLoginSchema } from '@/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email, type: 'admin' }).select(
      '+password'
    );

    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password || '');

    if (!isValidPassword) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      type: 'admin',
    });

    // Set cookie server-side
    (await cookies()).set('admin_token', token, {
      httpOnly: false, // false so client can still read it if needed, or we just rely on proxy
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return Response.json(
      {
        success: true,
        data: { token },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
