import { z } from 'zod';
import { ProjectStatus, ProjectType } from '@oneflow/shared';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().optional(),
    type: z.nativeEnum(ProjectType),
    budget: z.number().positive('Budget must be positive').optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    projectManagerId: z.string().uuid('Invalid project manager ID'),
    clientName: z.string().optional(),
    clientEmail: z.string().email('Invalid client email').optional(),
    teamMemberIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters').optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    budget: z.number().positive('Budget must be positive').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    progress: z.number().min(0).max(100).optional(),
    clientName: z.string().optional(),
    clientEmail: z.string().email('Invalid client email').optional(),
  }),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
});

export const addTeamMemberSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const removeTeamMemberSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const getProjectsQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    search: z.string().optional(),
  }),
});
