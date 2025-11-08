import { prisma } from '@/config/database';
import { DocumentStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class VendorBillsService {
  private async generateBillNumber(): Promise<string> {
    const lastBill = await prisma.vendorBill.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { billNumber: true },
    });

    if (!lastBill) return 'BILL-2025-0001';

    const lastNum = parseInt(lastBill.billNumber.split('-')[2]);
    return `BILL-2025-${String(lastNum + 1).padStart(4, '0')}`;
  }

  async createVendorBill(data: any, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { projectManager: true, members: true },
    });

    if (!project) throw new NotFoundError('Project not found');

    const isManager = project.projectManagerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    if (!isManager && !isAdmin && !isSalesFinance) {
      throw new ForbiddenError('Only project managers, admins, or sales/finance can create vendor bills');
    }

    const billNumber = await this.generateBillNumber();
    const tax = data.tax || 0;
    const totalAmount = data.amount + tax;

    const vendorBill = await prisma.vendorBill.create({
      data: {
        billNumber,
        projectId: data.projectId,
        purchaseOrderId: data.purchaseOrderId || null,
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
        amount: data.amount,
        tax,
        totalAmount,
        description: data.description,
        status: data.status || DocumentStatus.DRAFT,
        billDate: new Date(data.billDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Update project spent if bill is marked as paid
    if (data.status === DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: data.projectId },
        data: {
          spent: { increment: totalAmount },
          profit: { decrement: totalAmount },
        },
      });
    }

    logger.info(`Vendor bill ${billNumber} created by user ${userId}`);
    return vendorBill;
  }

  async getVendorBills(filters: any, userId: string, userRole: string) {
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

    return await prisma.vendorBill.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVendorBillById(id: string, userId: string, userRole: string) {
    const vendorBill = await prisma.vendorBill.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            projectManager: { select: { id: true, name: true, email: true } },
            members: { select: { userId: true } },
          },
        },
        purchaseOrder: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!vendorBill) throw new NotFoundError('Vendor bill not found');

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      const hasAccess =
        vendorBill.project.projectManagerId === userId ||
        vendorBill.project.members.some((m: any) => m.userId === userId);

      if (!hasAccess) throw new ForbiddenError('Access denied');
    }

    return vendorBill;
  }

  async updateVendorBill(id: string, data: any, userId: string, userRole: string) {
    const existing = await this.getVendorBillById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID && data.status !== DocumentStatus.PAID) {
      throw new BadRequestError('Cannot change status of paid bill');
    }

    const tax = data.tax !== undefined ? data.tax : existing.tax;
    const amount = data.amount !== undefined ? data.amount : existing.amount;
    const totalAmount = amount + (tax || 0);

    // Update project spent if status changes to/from PAID
    if (data.status === DocumentStatus.PAID && existing.status !== DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: {
          spent: { increment: totalAmount },
          profit: { decrement: totalAmount },
        },
      });
    } else if (existing.status === DocumentStatus.PAID && data.status !== DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: {
          spent: { decrement: existing.totalAmount },
          profit: { increment: existing.totalAmount },
        },
      });
    }

    const updated = await prisma.vendorBill.update({
      where: { id },
      data: {
        vendorName: data.vendorName,
        vendorEmail: data.vendorEmail,
        amount: data.amount,
        tax: data.tax,
        totalAmount,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paidDate: data.status === DocumentStatus.PAID ? new Date() : null,
      },
      include: {
        project: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    logger.info(`Vendor bill ${existing.billNumber} updated by user ${userId}`);
    return updated;
  }

  async deleteVendorBill(id: string, userId: string, userRole: string) {
    const existing = await this.getVendorBillById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot delete paid vendor bill');
    }

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      throw new ForbiddenError('Only admins or sales/finance can delete vendor bills');
    }

    await prisma.vendorBill.delete({ where: { id } });
    logger.info(`Vendor bill ${existing.billNumber} deleted by user ${userId}`);

    return { message: 'Vendor bill deleted successfully' };
  }
}

export const vendorBillsService = new VendorBillsService();
