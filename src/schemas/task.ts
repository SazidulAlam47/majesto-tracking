// src/schemas/task.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  tasks: z
    .array(z.string().min(1, 'Task description cannot be empty'))
    .min(1, 'At least one task is required')
    .max(20, 'Maximum 20 tasks allowed'),
  note: z.string().optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  driveLink: z.string().url('Invalid Drive URL').optional().or(z.literal('')),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
