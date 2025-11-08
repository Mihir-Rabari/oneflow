import { z } from 'zod';

// Strict email regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name sanitization - only letters, spaces, hyphens, apostrophes
const nameRegex = /^[a-zA-Z\s'-]+$/;

export const registerSchema = z.object({
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
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
    otp: z.string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
    password: z.string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .regex(emailRegex, 'Email must be a valid format')
      .transform(val => val.toLowerCase().trim()),
    otp: z.string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});
