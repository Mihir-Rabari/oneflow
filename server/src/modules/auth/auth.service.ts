import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { sessionService, otpService, cacheService } from '@/config/redis';
import { emailService } from '@/services/emailService';
import { generateOTP } from '@oneflow/shared';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@/utils/errors';
import { UserRole, UserStatus } from '@oneflow/shared';
import { logger } from '@/utils/logger';

export class AuthService {
  async register(email: string, name: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.TEAM_MEMBER,
        status: UserStatus.PENDING,
        emailVerified: false,
      },
    });

    // Generate OTP and store in Redis (600 seconds = 10 minutes)
    const otp = generateOTP(env.OTP_LENGTH);
    await otpService.storeOTP(user.email, otp, 'email_verification');

    // Send OTP email
    await emailService.sendOTPEmail(user.email, user.name, otp);
    
    logger.info(`OTP sent to ${user.email} for registration`);

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user.id,
      email: user.email,
    };
  }

  async verifyOTP(email: string, otp: string) {
    // Track attempts
    const attempts = await otpService.getAttempts(email, 'email_verification');
    if (attempts >= 5) {
      throw new BadRequestError('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP from Redis (auto-deletes on success)
    const isValid = await otpService.verifyAndDeleteOTP(email, otp, 'email_verification');
    
    if (!isValid) {
      await otpService.incrementAttempts(email, 'email_verification');
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Reset attempts on successful verification
    await otpService.resetAttempts(email, 'email_verification');

    // Find and update user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: UserStatus.ACTIVE,
        lastLogin: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(updatedUser.id, updatedUser.email, updatedUser.role);

    // Store session in Redis
    await sessionService.setSession(updatedUser.id, accessToken, 15 * 60); // 15 minutes

    // Cache user data (1 hour)
    await cacheService.set(`user:${updatedUser.id}`, updatedUser, 3600);

    // Send welcome email
    await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.name);

    logger.info(`User ${email} verified and logged in`);

    return {
      user: updatedUser,
      accessToken,
      refreshToken,
    };
  }

  async resendOTP(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Check if OTP was recently sent (prevent spam)
    const existingTTL = await otpService.getOTPTTL(email, 'email_verification');
    if (existingTTL > 540) { // If more than 9 minutes remaining (sent less than 1 min ago)
      throw new BadRequestError('Please wait before requesting a new OTP');
    }

    // Invalidate previous OTP
    await otpService.deleteOTP(email, 'email_verification');

    // Generate new OTP and store in Redis
    const otp = generateOTP(env.OTP_LENGTH);
    await otpService.storeOTP(email, otp, 'email_verification');

    // Send OTP email
    await emailService.sendOTPEmail(user.email, user.name, otp);

    logger.info(`OTP resent to ${email}`);

    return {
      message: 'OTP sent successfully',
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedError('Please verify your email first');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);

    // Store session in Redis
    await sessionService.setSession(user.id, accessToken, 15 * 60); // 15 minutes

    const { password: _, ...userWithoutPassword } = user;

    // Cache user data (1 hour)
    await cacheService.set(`user:${user.id}`, userWithoutPassword, 3600);

    logger.info(`User ${email} logged in successfully`);

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshTokenString: string) {
    try {
      const decoded = jwt.verify(refreshTokenString, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: UserRole;
      };

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE || !user.emailVerified) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);

      // Store new session
      await sessionService.setSession(user.id, accessToken, 15 * 60);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    await sessionService.deleteSession(userId, token);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset OTP and store in Redis
    const otp = generateOTP(env.OTP_LENGTH);
    await otpService.storeOTP(email, otp, 'password_reset');

    // Create reset link
    const resetLink = `${env.FRONTEND_URL}/reset-password?email=${email}&otp=${otp}`;

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

    logger.info(`Password reset OTP sent to ${email}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Verify OTP from Redis (auto-deletes on success)
    const isValid = await otpService.verifyAndDeleteOTP(email, otp, 'password_reset');
    
    if (!isValid) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions (security: force re-login on all devices)
    await sessionService.deleteAllUserSessions(user.id);

    // Invalidate cached user data
    await cacheService.del(`user:${user.id}`);

    logger.info(`Password reset successfully for ${email}`);

    return { message: 'Password reset successfully' };
  }

  private generateTokens(userId: string, email: string, role: UserRole) {
    const accessToken = jwt.sign(
      { userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
