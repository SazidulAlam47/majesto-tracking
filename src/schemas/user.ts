// src/schemas/user.ts
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
