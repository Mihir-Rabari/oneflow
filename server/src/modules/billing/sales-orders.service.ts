import { prisma } from '@/config/database';
import { DocumentStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class SalesOrdersService {
  // Generate unique order number
  private async generateOrderNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `SO-${currentYear}`;
    
    // Get the last order for this year
    const lastOrder = await prisma.salesOrder.findFirst({
      where: {
        orderNumber: {
          startsWith: yearPrefix,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    if (!lastOrder) {
      return `${yearPrefix}-0001`;
    }

    // Extract the number from format SO-YYYY-XXXX
    const parts = lastOrder.orderNumber.split('-');
    const lastNum = parseInt(parts[2] || '0');
    const nextNum = lastNum + 1;
    
    return `${yearPrefix}-${String(nextNum).padStart(4, '0')}`;
  }

  async createSalesOrder(data: any, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { projectManager: true, members: true },
    });

    if (!project) throw new NotFoundError('Project not found');

    // Check access
    const isManager = project.projectManagerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    if (!isManager && !isAdmin && !isSalesFinance) {
      throw new ForbiddenError('Only project managers, admins, or sales/finance can create sales orders');
    }

    const orderNumber = await this.generateOrderNumber();

    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNumber,
        projectId: data.projectId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        amount: data.amount,
        description: data.description,
        status: data.status || DocumentStatus.SENT,
        orderDate: new Date(data.orderDate),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Sales order ${orderNumber} created by user ${userId}`);
    return salesOrder;
  }

  async getSalesOrders(filters: any, userId: string, userRole: string) {
    const where: any = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.customerName) where.customerName = { contains: filters.customerName, mode: 'insensitive' };

    // Access control
    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      where.project = {
        OR: [
          { projectManagerId: userId },
          { members: { some: { userId } } },
        ],
      };
    }

    const salesOrders = await prisma.salesOrder.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        customerInvoices: { select: { id: true, invoiceNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return salesOrders;
  }

  async getSalesOrderById(id: string, userId: string, userRole: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            projectManager: { select: { id: true, name: true, email: true } },
            members: { select: { userId: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        customerInvoices: true,
      },
    });

    if (!salesOrder) throw new NotFoundError('Sales order not found');

    // Check access
    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      const hasAccess =
        salesOrder.project.projectManagerId === userId ||
        salesOrder.project.members.some((m) => m.userId === userId);

      if (!hasAccess) throw new ForbiddenError('Access denied');
    }

    return salesOrder;
  }

  async updateSalesOrder(id: string, data: any, userId: string, userRole: string) {
    const existing = await this.getSalesOrderById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot update paid sales order');
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        amount: data.amount,
        description: data.description,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    logger.info(`Sales order ${existing.orderNumber} updated by user ${userId}`);
    return updated;
  }

  async deleteSalesOrder(id: string, userId: string, userRole: string) {
    const existing = await this.getSalesOrderById(id, userId, userRole);

    if (existing.customerInvoices.length > 0) {
      throw new BadRequestError('Cannot delete sales order with linked invoices');
    }

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      throw new ForbiddenError('Only admins or sales/finance can delete sales orders');
    }

    await prisma.salesOrder.delete({ where: { id } });
    logger.info(`Sales order ${existing.orderNumber} deleted by user ${userId}`);

    return { message: 'Sales order deleted successfully' };
  }
}

export const salesOrdersService = new SalesOrdersService();
