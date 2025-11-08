import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';

const isDevelopment = env.NODE_ENV === 'development';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Disable in development
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: () => isDevelopment, // Disable in development
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: 'Too many OTP requests, please wait a minute.',
  skipSuccessfulRequests: false,
  skip: () => isDevelopment, // Disable in development
});
