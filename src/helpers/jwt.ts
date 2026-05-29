// src/helpers/jwt.ts
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '@/types';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

export const signToken = (
  payload: Omit<AuthPayload, 'iat' | 'exp'>
): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, getSecret(), { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    const decoded = jwt.verify(token, getSecret()) as AuthPayload;
    return decoded;
  } catch {
    return null;
  }
};
