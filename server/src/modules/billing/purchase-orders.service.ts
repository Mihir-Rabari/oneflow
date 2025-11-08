import { prisma } from '@/config/database';
import { DocumentStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class PurchaseOrdersService {
  private async generateOrderNumber(): Promise<string> {
    const lastOrder = await prisma.purchaseOrder.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    if (!lastOrder) return 'PO-2025-0001';

    const lastNum = parseInt(lastOrder.orderNumber.split('-')[2]);
    return `PO-2025-${String(lastNum + 1).padStart(4, '0')}`;
  }

  async createPurchaseOrder(data: any, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { projectManager: true, members: true },
    });

    if (!project) throw new NotFoundError('Project not found');

    const isManager = project.projectManagerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    if (!isManager && !isAdmin && !isSalesFinance) {
      throw new ForbiddenError('Only project managers, admins, or sales/finance can create purchase orders');
    }

    const orderNumber = await this.generateOrderNumber();

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        projectId: data.projectId,
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
        amount: data.amount,
        description: data.description,
        status: data.status || DocumentStatus.DRAFT,
        orderDate: new Date(data.orderDate),
        expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Purchase order ${orderNumber} created by user ${userId}`);
    return purchaseOrder;
  }

  async getPurchaseOrders(filters: any, userId: string, userRole: string) {
    const where: any = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.vendorName) where.vendorName = { contains: filters.vendorName, mode: 'insensitive' };

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      where.project = {
        OR: [
          { projectManagerId: userId },
          { members: { some: { userId } } },
        ],
      };
    }

    return await prisma.purchaseOrder.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        vendorBills: { select: { id: true, billNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPurchaseOrderById(id: string, userId: string, userRole: string) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            projectManager: { select: { id: true, name: true, email: true } },
            members: { select: { userId: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        vendorBills: true,
      },
    });

    if (!purchaseOrder) throw new NotFoundError('Purchase order not found');

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      const hasAccess =
        purchaseOrder.project.projectManagerId === userId ||
        purchaseOrder.project.members.some((m: any) => m.userId === userId);

      if (!hasAccess) throw new ForbiddenError('Access denied');
    }

    return purchaseOrder;
  }

  async updatePurchaseOrder(id: string, data: any, userId: string, userRole: string) {
    const existing = await this.getPurchaseOrderById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot update paid purchase order');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
        amount: data.amount,
        description: data.description,
        status: data.status,
        expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    logger.info(`Purchase order ${existing.orderNumber} updated by user ${userId}`);
    return updated;
  }

  async deletePurchaseOrder(id: string, userId: string, userRole: string) {
    const existing = await this.getPurchaseOrderById(id, userId, userRole);

    if (existing.vendorBills.length > 0) {
      throw new BadRequestError('Cannot delete purchase order with linked bills');
    }

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      throw new ForbiddenError('Only admins or sales/finance can delete purchase orders');
    }

    await prisma.purchaseOrder.delete({ where: { id } });
    logger.info(`Purchase order ${existing.orderNumber} deleted by user ${userId}`);

    return { message: 'Purchase order deleted successfully' };
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
