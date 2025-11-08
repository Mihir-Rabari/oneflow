import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@oneflow/shared';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    projectId: z.string().uuid('Invalid project ID'),
    assignedToId: z.string().uuid('Invalid user ID').optional(),
    priority: z.nativeEnum(TaskPriority),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
    progress: z.number().min(0).max(100).optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
  }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    projectId: z.string().uuid().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.string().uuid().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});
