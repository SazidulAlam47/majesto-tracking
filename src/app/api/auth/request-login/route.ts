// src/app/api/auth/request-login/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { requestLoginSchema } from '@/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = requestLoginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { name, signature } = parsed.data;

    // Check if a user with this signature already exists
    const existingUser = await User.findOne({ signature });

    if (existingUser) {
      if (existingUser.status === 'approved') {
        return Response.json(
          {
            success: true,
            data: { status: 'approved', token: existingUser.token },
            message: 'Access approved',
          },
          { status: 200 }
        );
      }

      if (existingUser.status === 'pending') {
        return Response.json(
          {
            success: true,
            data: { status: 'pending' },
            message: 'Your access request is pending approval',
          },
          { status: 200 }
        );
      }

      // If rejected, create a new request (update existing record)
      existingUser.name = name;
      existingUser.status = 'pending';
      existingUser.token = undefined;
      await existingUser.save();

      return Response.json(
        {
          success: true,
          data: { status: 'pending' },
          message: 'Access request resubmitted',
        },
        { status: 201 }
      );
    }

    // No existing user with this signature — create a new one
    await User.create({
      name,
      signature,
      status: 'pending',
      type: 'user',
    });

    return Response.json(
      {
        success: true,
        data: { status: 'pending' },
        message: 'Access request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Request login error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
