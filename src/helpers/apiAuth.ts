// src/helpers/apiAuth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import type { AuthPayload } from '@/types';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export const getAuthUser = async (request: NextRequest): Promise<AuthPayload | null> => {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  let token: string | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Try cookie fallback
  if (!token) {
    const adminToken = request.cookies.get('admin_token')?.value;
    const userToken = request.cookies.get('user_token')?.value;
    token = adminToken || userToken || request.cookies.get('token')?.value;
  }

  if (!token) return null;

  try {
    const payload = verifyToken(token);
    if (!payload || !payload.id) return null;

    // Connect to DB and check if user still exists
    await dbConnect();
    const user = await User.findById(payload.id);
    if (!user) return null;

    return payload;
  } catch (error) {
    return null;
  }
};

export const requireAuth = async (
  request: NextRequest
): Promise<{ user: AuthPayload } | { error: Response }> => {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { user };
};

export const requireAdmin = async (
  request: NextRequest
): Promise<{ user: AuthPayload } | { error: Response }> => {
  const result = await requireAuth(request);
  if ('error' in result) return result;

  if (result.user.type !== 'admin') {
    return {
      error: Response.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }
  return result;
};
