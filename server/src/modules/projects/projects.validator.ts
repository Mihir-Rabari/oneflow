import { z } from 'zod';
import { ProjectStatus, ProjectType } from '@oneflow/shared';

// Regex patterns
const projectNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
const clientNameRegex = /^[a-zA-Z\s'-]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name must not exceed 100 characters')
      .regex(projectNameRegex, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores')
      .transform(val => val.trim()),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .transform(val => val?.trim())
      .optional(),
    type: z.nativeEnum(ProjectType),
    budget: z.number()
      .positive('Budget must be positive')
      .max(999999999, 'Budget is too large')
      .optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    projectManagerId: z.string().uuid('Invalid project manager ID'),
    clientName: z.string()
      .min(2, 'Client name must be at least 2 characters')
      .max(100, 'Client name must not exceed 100 characters')
      .regex(clientNameRegex, 'Client name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val?.trim())
      .optional(),
    clientEmail: z.string()
      .email('Invalid client email')
      .regex(emailRegex, 'Please enter a valid email address')
      .transform(val => val?.toLowerCase().trim())
      .optional(),
    teamMemberIds: z.array(z.string().uuid()).optional(),
  }).refine(
    (data) => {
      // Validate date logic: endDate must be after startDate
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ).refine(
    (data) => {
      // Validate date logic: deadline must be after startDate
      if (data.deadline && data.startDate) {
        return new Date(data.deadline) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Deadline must be after start date',
      path: ['deadline'],
    }
  ).refine(
    (data) => {
      // Validate date logic: deadline should be before or equal to endDate
      if (data.deadline && data.endDate) {
        return new Date(data.deadline) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Deadline should be before or equal to end date',
      path: ['deadline'],
    }
  ),
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
