import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { sessionService } from '@/config/redis';
import { emailService } from '@/services/emailService';
import { generateOTP } from '@oneflow/shared';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@/utils/errors';
import { UserRole, UserStatus } from '@oneflow/shared';

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

    // Generate OTP
    const otp = generateOTP(env.OTP_LENGTH);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        email: user.email,
        otp,
        type: 'email_verification',
        expiresAt,
      },
    });

    // Send OTP email
    await emailService.sendOTPEmail(user.email, user.name, otp);

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user.id,
      email: user.email,
    };
  }

  async verifyOTP(email: string, otp: string) {
    // Find OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Update user
    const user = await prisma.user.update({
      where: { id: otpRecord.userId },
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
    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);

    // Store session
    await sessionService.setSession(user.id, accessToken, 15 * 60); // 15 minutes

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    return {
      user,
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

    // Invalidate previous OTPs
    await prisma.oTP.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new OTP
    const otp = generateOTP(env.OTP_LENGTH);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        email: user.email,
        otp,
        type: 'email_verification',
        expiresAt,
      },
    });

    // Send OTP email
    await emailService.sendOTPEmail(user.email, user.name, otp);

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

    // Store session
    await sessionService.setSession(user.id, accessToken, 15 * 60); // 15 minutes

    const { password: _, ...userWithoutPassword } = user;

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
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset OTP
    const otp = generateOTP(env.OTP_LENGTH);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        email: user.email,
        otp,
        type: 'password_reset',
        expiresAt,
      },
    });

    // Create reset link
    const resetLink = `${env.FRONTEND_URL}/reset-password?email=${email}&otp=${otp}`;

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Find OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        type: 'password_reset',
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: otpRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Invalidate all sessions
    await sessionService.deleteAllUserSessions(otpRecord.userId);

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
