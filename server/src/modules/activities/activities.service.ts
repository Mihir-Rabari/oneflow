import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class ActivitiesService {
  async getActivityLogs(
    userId: string,
    userRole: string,
    page = 1,
    limit = 50,
    projectId?: string,
    activityType?: string
  ) {
    const skip = (page - 1) * limit;
    const isAdmin = userRole === 'ADMIN';

    // Get user's accessible project IDs
    let accessibleProjectIds: string[] = [];
    if (!isAdmin) {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { projectManagerId: userId },
            { members: { some: { userId } } },
          ],
        },
        select: { id: true },
      });
      accessibleProjectIds = projects.map(p => p.id);
    }

    // Collect all activities
    const allActivities: any[] = [];

    // 1. Project created activities
    if (!activityType || activityType === 'all' || activityType === 'project_created') {
      const projectFilter: any = {};
      if (projectId) projectFilter.id = projectId;
      if (!isAdmin && accessibleProjectIds.length > 0) {
        projectFilter.id = { in: accessibleProjectIds };
      }

      const projects = await prisma.project.findMany({
        where: projectFilter,
        include: {
          projectManager: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      projects.forEach(p => {
        allActivities.push({
          type: 'project_created',
          entityId: p.id,
          entityName: p.name,
          userId: p.projectManagerId,
          userName: p.projectManager.name,
          userEmail: p.projectManager.email,
          userAvatar: p.projectManager.avatar,
          projectId: p.id,
          projectName: p.name,
          timestamp: p.createdAt,
          action: 'created a project',
        });
      });
    }

    // 2. Task created activities
    if (!activityType || activityType === 'all' || activityType === 'task_created') {
      const taskFilter: any = {};
      if (projectId) taskFilter.projectId = projectId;
      if (!isAdmin && accessibleProjectIds.length > 0) {
        taskFilter.projectId = { in: accessibleProjectIds };
      }

      const tasks = await prisma.task.findMany({
        where: taskFilter,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      tasks.forEach(t => {
        if (t.assignedTo) {
          allActivities.push({
            type: 'task_created',
            entityId: t.id,
            entityName: t.title,
            userId: t.assignedToId,
            userName: t.assignedTo.name,
            userEmail: t.assignedTo.email,
            userAvatar: t.assignedTo.avatar,
            projectId: t.projectId,
            projectName: t.project.name,
            timestamp: t.createdAt,
            action: 'created a task',
          });
        }
      });
    }

    // 3. Task completed activities
    if (!activityType || activityType === 'all' || activityType === 'task_completed') {
      const completedTaskFilter: any = { status: 'DONE' };
      if (projectId) completedTaskFilter.projectId = projectId;
      if (!isAdmin && accessibleProjectIds.length > 0) {
        completedTaskFilter.projectId = { in: accessibleProjectIds };
      }

      const completedTasks = await prisma.task.findMany({
        where: completedTaskFilter,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      completedTasks.forEach(t => {
        if (t.assignedTo) {
          allActivities.push({
            type: 'task_completed',
            entityId: t.id,
            entityName: t.title,
            userId: t.assignedToId,
            userName: t.assignedTo.name,
            userEmail: t.assignedTo.email,
            userAvatar: t.assignedTo.avatar,
            projectId: t.projectId,
            projectName: t.project.name,
            timestamp: t.updatedAt,
            action: 'completed a task',
          });
        }
      });
    }

    // 4. Task in progress activities
    if (!activityType || activityType === 'all' || activityType === 'task_in_progress') {
      const inProgressFilter: any = { status: 'IN_PROGRESS' };
      if (projectId) inProgressFilter.projectId = projectId;
      if (!isAdmin && accessibleProjectIds.length > 0) {
        inProgressFilter.projectId = { in: accessibleProjectIds };
      }

      const inProgressTasks = await prisma.task.findMany({
        where: inProgressFilter,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      inProgressTasks.forEach(t => {
        if (t.assignedTo) {
          allActivities.push({
            type: 'task_in_progress',
            entityId: t.id,
            entityName: t.title,
            userId: t.assignedToId,
            userName: t.assignedTo.name,
            userEmail: t.assignedTo.email,
            userAvatar: t.assignedTo.avatar,
            projectId: t.projectId,
            projectName: t.project.name,
            timestamp: t.updatedAt,
            action: 'started working on',
          });
        }
      });
    }

    // Sort all activities by timestamp and paginate
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(skip, skip + limit);

    return {
      activities: sortedActivities,
      pagination: {
        page,
        limit,
        total: allActivities.length,
        totalPages: Math.ceil(allActivities.length / limit),
      },
    };
  }

  async getRecentActivities(userId: string, userRole: string, limit = 10) {
    const result = await this.getActivityLogs(userId, userRole, 1, limit);
    return result.activities;
  }
}

export const activitiesService = new ActivitiesService();
