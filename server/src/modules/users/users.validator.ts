import { z } from 'zod';
import { UserRole, UserStatus } from '@oneflow/shared';

// Strict email regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name sanitization - only letters, spaces, hyphens, apostrophes
const nameRegex = /^[a-zA-Z\s'-]+$/;

export const createUserSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim()),
    role: z.nativeEnum(UserRole),
    phone: z.string().optional(),
    hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
    department: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim())
      .optional(),
    phone: z.string().optional(),
    hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
    department: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .transform(val => val.trim())
      .optional(),
    phone: z.string().optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    search: z.string().optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});
