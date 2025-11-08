import { prisma } from '@/config/database';
import { DocumentStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class InvoicesService {
  private async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await prisma.customerInvoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    if (!lastInvoice) return 'INV-2025-0001';

    const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    return `INV-2025-${String(lastNum + 1).padStart(4, '0')}`;
  }

  async createInvoice(data: any, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { projectManager: true, members: true },
    });

    if (!project) throw new NotFoundError('Project not found');

    const isManager = project.projectManagerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isSalesFinance = userRole === 'SALES_FINANCE';

    if (!isManager && !isAdmin && !isSalesFinance) {
      throw new ForbiddenError('Only project managers, admins, or sales/finance can create invoices');
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const tax = data.tax || 0;
    const totalAmount = data.amount + tax;

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        projectId: data.projectId,
        salesOrderId: data.salesOrderId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        amount: data.amount,
        tax,
        totalAmount,
        description: data.description,
        status: data.status || DocumentStatus.DRAFT,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        salesOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Update project revenue if invoice is marked as paid
    if (data.status === DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: data.projectId },
        data: {
          revenue: { increment: totalAmount },
          profit: { increment: totalAmount - project.spent },
        },
      });
    }

    logger.info(`Invoice ${invoiceNumber} created by user ${userId}`);
    return invoice;
  }

  async getInvoices(filters: any, userId: string, userRole: string) {
    const where: any = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.customerName) where.customerName = { contains: filters.customerName, mode: 'insensitive' };

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      where.project = {
        OR: [
          { projectManagerId: userId },
          { members: { some: { userId } } },
        ],
      };
    }

    return await prisma.customerInvoice.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        salesOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceById(id: string, userId: string, userRole: string) {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            projectManager: { select: { id: true, name: true, email: true } },
            members: { select: { userId: true } },
          },
        },
        salesOrder: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invoice) throw new NotFoundError('Invoice not found');

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      const hasAccess =
        invoice.project.projectManagerId === userId ||
        invoice.project.members.some((m: any) => m.userId === userId);

      if (!hasAccess) throw new ForbiddenError('Access denied');
    }

    return invoice;
  }

  async updateInvoice(id: string, data: any, userId: string, userRole: string) {
    const existing = await this.getInvoiceById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID && data.status !== DocumentStatus.PAID) {
      throw new BadRequestError('Cannot change status of paid invoice');
    }

    const tax = data.tax !== undefined ? data.tax : existing.tax;
    const amount = data.amount !== undefined ? data.amount : existing.amount;
    const totalAmount = amount + (tax || 0);

    // Update project revenue if status changes to/from PAID
    if (data.status === DocumentStatus.PAID && existing.status !== DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: {
          revenue: { increment: totalAmount },
        },
      });
    } else if (existing.status === DocumentStatus.PAID && data.status !== DocumentStatus.PAID) {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: {
          revenue: { decrement: existing.totalAmount },
        },
      });
    }

    const updated = await prisma.customerInvoice.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
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
        salesOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    logger.info(`Invoice ${existing.invoiceNumber} updated by user ${userId}`);
    return updated;
  }

  async deleteInvoice(id: string, userId: string, userRole: string) {
    const existing = await this.getInvoiceById(id, userId, userRole);

    if (existing.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot delete paid invoice');
    }

    if (userRole !== 'ADMIN' && userRole !== 'SALES_FINANCE') {
      throw new ForbiddenError('Only admins or sales/finance can delete invoices');
    }

    await prisma.customerInvoice.delete({ where: { id } });
    logger.info(`Invoice ${existing.invoiceNumber} deleted by user ${userId}`);

    return { message: 'Invoice deleted successfully' };
  }
}

export const invoicesService = new InvoicesService();
