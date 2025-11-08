import { prisma } from '@/config/database';
import { cacheService } from '@/config/redis';
import { emailService } from '@/services/emailService';
import { projectsService } from '@/modules/projects/projects.service';
import { TaskStatus, TaskPriority } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class TasksService {
  async getAllTasks(
    userId: string,
    userRole: string,
    projectId?: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    assignedToId?: string,
    page = 1,
    limit = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    // Filter by user access
    if (userRole !== 'ADMIN') {
      where.OR = [
        { assignedToId: userId },
        { createdById: userId },
        { project: { projectManagerId: userId } },
        { project: { members: { some: { userId } } } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTaskById(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, projectManagerId: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check access
    if (userRole !== 'ADMIN') {
      const hasAccess =
        task.assignedToId === userId ||
        task.createdById === userId ||
        task.project.projectManagerId === userId;

      if (!hasAccess) {
        const isMember = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: task.projectId,
              userId,
            },
          },
        });

        if (!isMember) {
          throw new ForbiddenError('You do not have access to this task');
        }
      }
    }

    return task;
  }

  async createTask(data: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string;
    priority: TaskPriority;
    dueDate?: Date;
    estimatedHours?: number;
    createdById: string;
  }) {
    const task = await prisma.task.create({
      data: {
        ...data,
        status: TaskStatus.NEW,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalidate project stats cache
    await cacheService.del(`project:${data.projectId}:stats`);

    // Update project progress
    await projectsService.updateProjectProgress(data.projectId);

    // Send email notification if assigned
    if (data.assignedToId && task.assignedTo) {
      await emailService.sendTaskAssignment(
        task.assignedTo.email,
        task.assignedTo.name,
        task.title,
        task.project.name,
        task.id,
        {
          taskDescription: task.description || undefined,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
          estimatedHours: task.estimatedHours || undefined,
          assignedByName: task.createdBy?.name || 'System',
        }
      );
    }

    logger.info(`Task ${task.id} created in project ${data.projectId}`);

    return task;
  }

  async updateTask(
    taskId: string,
    userId: string,
    userRole: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedToId?: string;
      dueDate?: Date;
      estimatedHours?: number;
      progress?: number;
    }
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { projectManagerId: true } },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check permission
    if (userRole !== 'ADMIN' && task.project.projectManagerId !== userId && task.createdById !== userId) {
      throw new ForbiddenError('Only project manager, task creator, or admin can update task');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalidate project stats cache
    await cacheService.del(`project:${task.projectId}:stats`);

    // Update project progress if status changed
    if (data.status) {
      await projectsService.updateProjectProgress(task.projectId);
    }

    logger.info(`Task ${taskId} updated`);

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { projectManagerId: true } },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only PM or admin can delete
    if (userRole !== 'ADMIN' && task.project.projectManagerId !== userId) {
      throw new ForbiddenError('Only project manager or admin can delete task');
    }

    const projectId = task.projectId;
    
    await prisma.task.delete({ where: { id: taskId } });

    // Invalidate project stats cache
    await cacheService.del(`project:${projectId}:stats`);

    // Update project progress
    await projectsService.updateProjectProgress(projectId);

    logger.info(`Task ${taskId} deleted`);

    return { message: 'Task deleted successfully' };
  }

  async addComment(taskId: string, userId: string, content: string) {
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    logger.info(`Comment added to task ${taskId} by user ${userId}`);

    return comment;
  }

  async getTasksByProject(projectId: string, status?: TaskStatus) {
    const where: any = { projectId };
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }],
    });

    // Group by status for Kanban board
    const kanban = {
      new: tasks.filter((t) => t.status === TaskStatus.NEW),
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      blocked: tasks.filter((t) => t.status === TaskStatus.BLOCKED),
      done: tasks.filter((t) => t.status === TaskStatus.DONE),
    };

    return kanban;
  }
}

export const tasksService = new TasksService();
