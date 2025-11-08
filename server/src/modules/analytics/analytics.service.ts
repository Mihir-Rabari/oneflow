import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ForbiddenError } from '@/utils/errors';

export class AnalyticsService {
  // Dashboard overview stats
  async getDashboardStats(userId: string, userRole: string) {
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    console.log('📊 Dashboard Stats Request:', { userId, userRole, isAdmin, isSalesFinance });

    // Get user's accessible projects
    const projectFilter: any = isAdmin || isSalesFinance
      ? {}
      : {
          OR: [
            { projectManagerId: userId },
            { members: { some: { userId } } },
          ],
        };

    console.log('🔍 Project Filter:', JSON.stringify(projectFilter));

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalUsers,
      totalHoursLogged,
      totalRevenue,
      totalSpent,
      recentProjects,
      upcomingDeadlines,
    ] = await Promise.all([
      // Total projects
      prisma.project.count({ where: projectFilter }),

      // Active projects
      prisma.project.count({
        where: { ...projectFilter, status: 'IN_PROGRESS' },
      }),

      // Total tasks
      prisma.task.count({
        where: { project: projectFilter },
      }),

      // Completed tasks
      prisma.task.count({
        where: { project: projectFilter, status: 'DONE' },
      }),

      // Total users (only admins see this)
      isAdmin || isSalesFinance ? prisma.user.count() : Promise.resolve(0),

      // Total hours logged
      prisma.timesheet.aggregate({
        where: { project: projectFilter },
        _sum: { hours: true },
      }),

      // Total revenue
      prisma.project.aggregate({
        where: projectFilter,
        _sum: { revenue: true },
      }),

      // Total spent
      prisma.project.aggregate({
        where: projectFilter,
        _sum: { spent: true },
      }),

      // Recent projects
      prisma.project.findMany({
        where: projectFilter,
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Upcoming deadlines
      prisma.task.findMany({
        where: {
          project: projectFilter,
          dueDate: { gte: new Date() },
          status: { not: 'DONE' },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          project: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    console.log('📈 Query Results:', {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalUsers,
      totalHoursLogged: totalHoursLogged._sum.hours,
      totalRevenue: totalRevenue._sum.revenue,
      totalSpent: totalSpent._sum.spent,
      recentProjectsCount: recentProjects.length
    });

    const result = {
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0',
        totalUsers: isAdmin || isSalesFinance ? totalUsers : null,
      },
      financials: {
        totalRevenue: totalRevenue._sum.revenue || 0,
        totalSpent: totalSpent._sum.spent || 0,
        profit: (totalRevenue._sum.revenue || 0) - (totalSpent._sum.spent || 0),
        totalHoursLogged: totalHoursLogged._sum.hours || 0,
      },
      recentProjects,
      upcomingDeadlines,
    };

    console.log('✅ Returning Dashboard Stats:', JSON.stringify(result, null, 2));

    return result;
  }

  // Financial reports
  async getFinancialReport(filters: any, userId: string, userRole: string) {
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    if (!isAdmin && !isSalesFinance) {
      throw new ForbiddenError('Only admins and sales/finance can view financial reports');
    }

    const where: any = {};

    if (filters.projectId) where.id = filters.projectId;
    if (filters.status) where.status = filters.status;

    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        type: true,
        budget: true,
        spent: true,
        revenue: true,
        profit: true,
        projectManager: { select: { name: true, email: true } },
        _count: {
          select: {
            tasks: true,
            timesheets: true,
            salesOrders: true,
            customerInvoices: true,
            vendorBills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totals = await prisma.project.aggregate({
      where,
      _sum: {
        budget: true,
        spent: true,
        revenue: true,
        profit: true,
      },
    });

    return {
      projects,
      summary: {
        totalBudget: totals._sum.budget || 0,
        totalSpent: totals._sum.spent || 0,
        totalRevenue: totals._sum.revenue || 0,
        totalProfit: totals._sum.profit || 0,
        projectCount: projects.length,
      },
    };
  }

  // Team performance report
  async getTeamPerformance(filters: any, userId: string, userRole: string) {
    const isAdmin = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

    if (!isAdmin) {
      throw new ForbiddenError('Only admins and PMs can view team performance');
    }

    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: { in: ['PROJECT_MANAGER', 'TEAM_MEMBER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hourlyRate: true,
        _count: {
          select: {
            assignedTasks: true,
            timesheets: true,
          },
        },
      },
    });

    const performanceData = await Promise.all(
      users.map(async (user) => {
        const [completedTasks, totalHours, billableHours] = await Promise.all([
          prisma.task.count({
            where: { assignedToId: user.id, status: 'DONE' },
          }),

          prisma.timesheet.aggregate({
            where: { userId: user.id },
            _sum: { hours: true },
          }),

          prisma.timesheet.aggregate({
            where: { userId: user.id, isBillable: true },
            _sum: { hours: true },
          }),
        ]);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hourlyRate: user.hourlyRate,
          totalTasks: user._count.assignedTasks,
          completedTasks,
          totalHours: totalHours._sum.hours || 0,
          billableHours: billableHours._sum.hours || 0,
          utilization: totalHours._sum.hours ? ((billableHours._sum.hours || 0) / totalHours._sum.hours * 100).toFixed(2) : '0',
        };
      })
    );

    return {
      team: performanceData,
      summary: {
        totalMembers: users.length,
        totalHours: performanceData.reduce((sum, u) => sum + u.totalHours, 0),
        totalBillableHours: performanceData.reduce((sum, u) => sum + u.billableHours, 0),
        avgUtilization: (
          performanceData.reduce((sum, u) => sum + parseFloat(u.utilization), 0) / users.length
        ).toFixed(2),
      },
    };
  }

  // Project timeline analytics
  async getProjectTimeline(projectId: string, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectManager: true,
        members: { select: { userId: true } },
      },
    });

    if (!project) throw new ForbiddenError('Project not found');

    const isAdmin = userRole === 'ADMIN';
    const isManager = project.projectManagerId === userId;
    const isMember = project.members.some((m: any) => m.userId === userId);

    if (!isAdmin && !isManager && !isMember) {
      throw new ForbiddenError('Access denied');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        completedDate: true,
        dueDate: true,
        estimatedHours: true,
        actualHours: true,
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const milestones = tasks.filter((t) => t.status === 'DONE').map((t) => ({
      taskId: t.id,
      title: t.title,
      completedAt: t.completedDate,
      assignee: t.assignedTo?.name,
    }));

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        startDate: project.startDate,
        deadline: project.deadline,
      },
      tasks,
      milestones,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        blockedTasks: tasks.filter((t) => t.status === 'BLOCKED').length,
        onTime: tasks.filter((t) => !t.dueDate || t.status === 'DONE' && t.completedDate && t.completedDate <= t.dueDate).length,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
