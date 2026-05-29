// src/helpers/apiAuth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import type { AuthPayload } from '@/types';

export const getAuthUser = (request: NextRequest): AuthPayload | null => {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try cookie fallback
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
};

export const requireAuth = (
  request: NextRequest
): { user: AuthPayload } | { error: Response } => {
  const user = getAuthUser(request);
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

export const requireAdmin = (
  request: NextRequest
): { user: AuthPayload } | { error: Response } => {
  const result = requireAuth(request);
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
