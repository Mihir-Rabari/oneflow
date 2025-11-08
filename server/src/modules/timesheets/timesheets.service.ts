import { prisma } from '@/config/database';
import { cacheService } from '@/config/redis';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class TimesheetsService {
  async getAllTimesheets(
    userId: string,
    userRole: string,
    projectId?: string,
    taskId?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Filter by user access
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
          task: {
            select: { id: true, title: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.timesheet.count({ where }),
    ]);

    return {
      timesheets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createTimesheet(data: {
    userId: string;
    projectId: string;
    taskId?: string;
    date: Date;
    hours: number;
    description?: string;
    billable: boolean;
  }) {
    // Validate hours
    if (data.hours <= 0 || data.hours > 24) {
      throw new BadRequestError('Hours must be between 0 and 24');
    }

    const timesheet = await prisma.timesheet.create({
      data,
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    // Invalidate project stats cache
    await cacheService.del(`project:${data.projectId}:stats`);

    logger.info(`Timesheet created: ${data.hours}h for project ${data.projectId}`);

    return timesheet;
  }

  async updateTimesheet(
    timesheetId: string,
    userId: string,
    userRole: string,
    data: {
      hours?: number;
      description?: string;
      billable?: boolean;
    }
  ) {
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });

    if (!timesheet) {
      throw new NotFoundError('Timesheet not found');
    }

    // Only owner or admin can update
    if (userRole !== 'ADMIN' && timesheet.userId !== userId) {
      throw new ForbiddenError('You can only update your own timesheets');
    }

    if (data.hours && (data.hours <= 0 || data.hours > 24)) {
      throw new BadRequestError('Hours must be between 0 and 24');
    }

    const updated = await prisma.timesheet.update({
      where: { id: timesheetId },
      data,
    });

    // Invalidate project stats cache
    await cacheService.del(`project:${timesheet.projectId}:stats`);

    logger.info(`Timesheet ${timesheetId} updated`);

    return updated;
  }

  async deleteTimesheet(timesheetId: string, userId: string, userRole: string) {
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });

    if (!timesheet) {
      throw new NotFoundError('Timesheet not found');
    }

    // Only owner or admin can delete
    if (userRole !== 'ADMIN' && timesheet.userId !== userId) {
      throw new ForbiddenError('You can only delete your own timesheets');
    }

    await prisma.timesheet.delete({ where: { id: timesheetId } });

    // Invalidate project stats cache
    await cacheService.del(`project:${timesheet.projectId}:stats`);

    logger.info(`Timesheet ${timesheetId} deleted`);

    return { message: 'Timesheet deleted successfully' };
  }

  async getUserStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const stats = await prisma.timesheet.aggregate({
      where,
      _sum: { hours: true },
      _count: true,
    });

    const billableStats = await prisma.timesheet.aggregate({
      where: { ...where, billable: true },
      _sum: { hours: true },
    });

    return {
      totalHours: stats._sum.hours || 0,
      totalEntries: stats._count,
      billableHours: billableStats._sum.hours || 0,
      nonBillableHours: (stats._sum.hours || 0) - (billableStats._sum.hours || 0),
    };
  }
}

export const timesheetsService = new TimesheetsService();
