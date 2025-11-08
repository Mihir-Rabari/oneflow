import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { prisma } from '@/config/database';
import { sessionService } from '@/config/redis';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { asyncHandler } from '@/utils/asyncHandler';
import { UserRole } from '@oneflow/shared';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    // Check if session exists in Redis
    const session = await sessionService.getSession(decoded.userId, token);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, emailVerified: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError('Email not verified');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    throw error;
  }
});

export const authorize = (...roles: UserRole[]) => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  });
};

// Check if user is admin or project manager
export const isAdminOrPM = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (![UserRole.ADMIN, UserRole.PROJECT_MANAGER].includes(req.user.role)) {
    throw new ForbiddenError('Only admins and project managers can perform this action');
  }

  next();
});

// Check if user is project member or manager
export const isProjectMember = (projectIdParam = 'projectId') => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const projectId = req.params[projectIdParam] || req.body.projectId;

    if (!projectId) {
      throw new ForbiddenError('Project ID is required');
    }

    // Admins can access all projects
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is project manager or member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: req.user.id },
        },
      },
    });

    if (!project) {
      throw new ForbiddenError('Project not found');
    }

    const isManager = project.projectManagerId === req.user.id;
    const isMember = project.members.length > 0;

    if (!isManager && !isMember) {
      throw new ForbiddenError('You are not a member of this project');
    }

    next();
  });
};
