// src/schemas/auth.ts
import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const requestLoginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  signature: z.string().min(1, 'Device signature is required'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RequestLoginInput = z.infer<typeof requestLoginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
