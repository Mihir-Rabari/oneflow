import { prisma } from '@/config/database';
import { emailService } from '@/services/emailService';
import { ProjectStatus, ProjectType } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';

export class ProjectsService {
  async getAllProjects(
    userId: string,
    userRole: string,
    page = 1,
    limit = 20,
    status?: ProjectStatus,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter based on role
    if (userRole !== 'ADMIN') {
      where.OR = [
        { projectManagerId: userId },
        { members: { some: { userId } } },
      ];
    }

    if (status) where.status = status;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          projectManager: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
              timesheets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(projectId: string, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            timesheets: true,
            salesOrders: true,
            purchaseOrders: true,
            customerInvoices: true,
            vendorBills: true,
            expenses: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check access
    if (userRole !== 'ADMIN') {
      const hasAccess =
        project.projectManagerId === userId ||
        project.members.some((m) => m.userId === userId);

      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this project');
      }
    }

    return project;
  }

  async createProject(data: {
    name: string;
    description?: string;
    type: ProjectType;
    budget?: number;
    startDate: Date;
    endDate?: Date;
    deadline?: Date;
    projectManagerId: string;
    clientName?: string;
    clientEmail?: string;
    teamMemberIds?: string[];
  }) {
    // Verify project manager exists
    const pm = await prisma.user.findUnique({
      where: { id: data.projectManagerId },
    });

    if (!pm) {
      throw new NotFoundError('Project manager not found');
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        budget: data.budget,
        startDate: data.startDate,
        endDate: data.endDate,
        deadline: data.deadline,
        projectManagerId: data.projectManagerId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        status: ProjectStatus.PLANNED,
        progress: 0,
        spent: 0,
        revenue: 0,
        profit: 0,
      },
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Add team members
    if (data.teamMemberIds && data.teamMemberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: data.teamMemberIds.map((userId) => ({
          projectId: project.id,
          userId,
        })),
      });

      // Send invitation emails
      const members = await prisma.user.findMany({
        where: { id: { in: data.teamMemberIds } },
        select: { name: true, email: true },
      });

      for (const member of members) {
        await emailService.sendProjectInvitation(
          member.email,
          member.name,
          project.name,
          pm.name
        );
      }
    }

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    userRole: string,
    data: {
      name?: string;
      description?: string;
      status?: ProjectStatus;
      budget?: number;
      startDate?: Date;
      endDate?: Date;
      deadline?: Date;
      progress?: number;
      clientName?: string;
      clientEmail?: string;
    }
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check permission
    if (userRole !== 'ADMIN' && project.projectManagerId !== userId) {
      throw new ForbiddenError('Only project manager or admin can update project');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedProject;
  }

  async deleteProject(projectId: string, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Only admin or project manager can delete
    if (userRole !== 'ADMIN' && project.projectManagerId !== userId) {
      throw new ForbiddenError('Only project manager or admin can delete project');
    }

    // Check if project has financial records
    const hasRecords = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        _count: {
          select: {
            salesOrders: true,
            customerInvoices: true,
            vendorBills: true,
          },
        },
      },
    });

    if (
      hasRecords &&
      (hasRecords._count.salesOrders > 0 ||
        hasRecords._count.customerInvoices > 0 ||
        hasRecords._count.vendorBills > 0)
    ) {
      throw new BadRequestError(
        'Cannot delete project with financial records. Archive it instead.'
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  async addTeamMember(projectId: string, userId: string, memberId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check permission
    if (userRole !== 'ADMIN' && project.projectManagerId !== userId) {
      throw new ForbiddenError('Only project manager or admin can add team members');
    }

    // Check if member exists
    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundError('User not found');
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    if (existing) {
      throw new BadRequestError('User is already a team member');
    }

    // Add member
    await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberId,
      },
    });

    // Send invitation email
    await emailService.sendProjectInvitation(
      member.email,
      member.name,
      project.name,
      'Project Manager'
    );

    return { message: 'Team member added successfully' };
  }

  async removeTeamMember(projectId: string, userId: string, memberId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check permission
    if (userRole !== 'ADMIN' && project.projectManagerId !== userId) {
      throw new ForbiddenError('Only project manager or admin can remove team members');
    }

    // Cannot remove project manager
    if (memberId === project.projectManagerId) {
      throw new BadRequestError('Cannot remove project manager from team');
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    return { message: 'Team member removed successfully' };
  }

  async getProjectStats(projectId: string) {
    const [taskStats, timesheetStats, financialStats] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      prisma.timesheet.aggregate({
        where: { projectId },
        _sum: { hours: true },
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          budget: true,
          spent: true,
          revenue: true,
          profit: true,
          _count: {
            select: {
              salesOrders: true,
              customerInvoices: true,
              expenses: true,
            },
          },
        },
      }),
    ]);

    const tasks = taskStats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      tasks: {
        new: tasks.new || 0,
        inProgress: tasks.in_progress || 0,
        blocked: tasks.blocked || 0,
        done: tasks.done || 0,
        total: Object.values(tasks).reduce((sum, count) => sum + count, 0),
      },
      timesheets: {
        totalHours: timesheetStats._sum.hours || 0,
      },
      financial: {
        budget: financialStats?.budget || 0,
        spent: financialStats?.spent || 0,
        revenue: financialStats?.revenue || 0,
        profit: financialStats?.profit || 0,
        salesOrders: financialStats?._count.salesOrders || 0,
        invoices: financialStats?._count.customerInvoices || 0,
        expenses: financialStats?._count.expenses || 0,
      },
    };
  }
}

export const projectsService = new ProjectsService();
