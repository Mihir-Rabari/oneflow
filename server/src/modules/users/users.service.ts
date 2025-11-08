import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { emailService } from '@/services/emailService';
import { cacheService } from '@/config/redis';
import { UserRole, UserStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { generateOTP } from '@oneflow/shared';
import { logger } from '@/utils/logger';

export class UsersService {
  async getAllUsers(page = 1, limit = 20, role?: UserRole, status?: UserStatus, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatar: true,
          phone: true,
          department: true,
          hourlyRate: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    // Try cache first
    const cacheKey = `user:${userId}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      logger.debug(`User ${userId} retrieved from cache`);
      return cached;
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        department: true,
        hourlyRate: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            managedProjects: true,
            projectMemberships: true,
            assignedTasks: true,
            timesheets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cache for 1 hour
    await cacheService.set(cacheKey, user, 3600);
    logger.debug(`User ${userId} cached for 1 hour`);

    return user;
  }

  async createUser(
    email: string,
    name: string,
    role: UserRole,
    phone?: string,
    hourlyRate?: number,
    department?: string
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + '@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phone,
        hourlyRate,
        department,
        status: UserStatus.ACTIVE,
        emailVerified: true, // Admin-created users are pre-verified
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
        hourlyRate: true,
        createdAt: true,
      },
    });

    // Send credentials email
    await emailService.sendNewUserCredentials(email, name, email, tempPassword, role);

    return user;
  }

  async updateUser(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      hourlyRate?: number;
      department?: string;
      status?: UserStatus;
      role?: UserRole;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        department: true,
        hourlyRate: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    // Update cache
    await cacheService.set(`user:${userId}`, updatedUser, 3600);
    logger.debug(`User ${userId} cache updated`);

    return updatedUser;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      avatar?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        department: true,
        hourlyRate: true,
        updatedAt: true,
      },
    });

    // Update cache
    await cacheService.set(`user:${userId}`, user, 3600);
    logger.debug(`User ${userId} profile cache updated`);

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteUser(userId: string, requestingUserId: string) {
    if (userId === requestingUserId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is managing any active projects
    const activeProjects = await prisma.project.count({
      where: {
        projectManagerId: userId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
      },
    });

    if (activeProjects > 0) {
      throw new ForbiddenError(
        'Cannot delete user who is managing active projects. Please reassign projects first.'
      );
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.INACTIVE },
    });

    // Invalidate cache
    await cacheService.del(`user:${userId}`);
    logger.info(`User ${userId} deactivated and cache invalidated`);

    return { message: 'User deactivated successfully' };
  }

  async getUserStats(userId: string) {
    const [projectsManaged, projectsMember, tasksAssigned, tasksCompleted, totalHours] =
      await Promise.all([
        prisma.project.count({
          where: { projectManagerId: userId },
        }),
        prisma.projectMember.count({
          where: { userId },
        }),
        prisma.task.count({
          where: { assignedToId: userId },
        }),
        prisma.task.count({
          where: { assignedToId: userId, status: 'DONE' },
        }),
        prisma.timesheet.aggregate({
          where: { userId },
          _sum: { hours: true },
        }),
      ]);

    return {
      projectsManaged,
      projectsMember,
      tasksAssigned,
      tasksCompleted,
      totalHours: totalHours._sum.hours || 0,
    };
  }
}

export const usersService = new UsersService();
