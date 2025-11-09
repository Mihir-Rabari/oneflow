import { prisma } from '@/config/database';
import { DocumentStatus } from '@oneflow/shared';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

export class ApprovalsService {
  /**
   * Get all pending approvals for Sales & Finance team
   */
  async getPendingApprovals(userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can access approval queue');
    }

    const [salesOrders, purchaseOrders, invoices, vendorBills] = await Promise.all([
      // Sales Orders pending approval
      prisma.salesOrder.findMany({
        where: {
          status: {
            in: [DocumentStatus.DRAFT, DocumentStatus.SENT],
          },
        },
        include: {
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Purchase Orders pending approval
      prisma.purchaseOrder.findMany({
        where: {
          status: {
            in: [DocumentStatus.DRAFT, DocumentStatus.SENT],
          },
        },
        include: {
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Invoices pending approval
      prisma.customerInvoice.findMany({
        where: {
          status: {
            in: [DocumentStatus.DRAFT, DocumentStatus.SENT],
          },
        },
        include: {
          project: { select: { id: true, name: true } },
          salesOrder: { select: { id: true, orderNumber: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Vendor Bills pending approval
      prisma.vendorBill.findMany({
        where: {
          status: {
            in: [DocumentStatus.DRAFT, DocumentStatus.SENT],
          },
        },
        include: {
          project: { select: { id: true, name: true } },
          purchaseOrder: { select: { id: true, orderNumber: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      salesOrders,
      purchaseOrders,
      invoices,
      vendorBills,
      summary: {
        totalPending: salesOrders.length + purchaseOrders.length + invoices.length + vendorBills.length,
        salesOrdersCount: salesOrders.length,
        purchaseOrdersCount: purchaseOrders.length,
        invoicesCount: invoices.length,
        vendorBillsCount: vendorBills.length,
      },
    };
  }

  /**
   * Approve a sales order
   */
  async approveSalesOrder(id: string, userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can approve sales orders');
    }

    const salesOrder = await prisma.salesOrder.findUnique({ where: { id } });
    if (!salesOrder) throw new NotFoundError('Sales order not found');

    if (salesOrder.status === DocumentStatus.APPROVED) {
      throw new BadRequestError('Sales order is already approved');
    }

    if (salesOrder.status === DocumentStatus.PAID || salesOrder.status === DocumentStatus.CANCELLED) {
      throw new BadRequestError('Cannot approve a paid or cancelled sales order');
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: {
        status: DocumentStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Sales order ${salesOrder.orderNumber} approved by user ${userId}`);

    // Send approval email
    try {
      const { emailNotificationService } = await import('@/services/email-notification.service');
      await emailNotificationService.sendApprovalNotification({
        employeeName: updated.createdBy.name,
        employeeEmail: updated.createdBy.email,
        documentNumber: salesOrder.orderNumber,
        documentType: 'Sales Order',
        amount: `$${salesOrder.amount.toFixed(2)}`,
        projectName: updated.project.name,
        approvedBy: 'Finance Team',
        dashboardUrl: `${env.FRONTEND_URL}/sales-orders/${id}`,
      });
    } catch (emailError) {
      logger.error('Failed to send approval email:', emailError);
    }

    return updated;
  }

  /**
   * Reject a sales order
   */
  async rejectSalesOrder(id: string, userId: string, userRole: string, reason?: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can reject sales orders');
    }

    const salesOrder = await prisma.salesOrder.findUnique({ where: { id } });
    if (!salesOrder) throw new NotFoundError('Sales order not found');

    if (salesOrder.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot reject a paid sales order');
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: {
        status: DocumentStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Sales order ${salesOrder.orderNumber} rejected by user ${userId}. Reason: ${reason || 'N/A'}`);

    // Send rejection email
    try {
      const { emailNotificationService } = await import('@/services/email-notification.service');
      await emailNotificationService.sendRejectionNotification({
        employeeName: updated.createdBy.name,
        employeeEmail: updated.createdBy.email,
        documentNumber: salesOrder.orderNumber,
        documentType: 'Sales Order',
        amount: `$${salesOrder.amount.toFixed(2)}`,
        projectName: updated.project.name,
        approvedBy: 'Finance Team',
        remark: reason || 'No reason provided',
        dashboardUrl: `${env.FRONTEND_URL}/sales-orders/${id}`,
      });
    } catch (emailError) {
      logger.error('Failed to send rejection email:', emailError);
    }

    return updated;
  }

  /**
   * Approve a purchase order
   */
  async approvePurchaseOrder(id: string, userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can approve purchase orders');
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundError('Purchase order not found');

    if (purchaseOrder.status === DocumentStatus.APPROVED) {
      throw new BadRequestError('Purchase order is already approved');
    }

    if (purchaseOrder.status === DocumentStatus.PAID || purchaseOrder.status === DocumentStatus.CANCELLED) {
      throw new BadRequestError('Cannot approve a paid or cancelled purchase order');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: DocumentStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Purchase order ${purchaseOrder.orderNumber} approved by user ${userId}`);
    return updated;
  }

  /**
   * Reject a purchase order
   */
  async rejectPurchaseOrder(id: string, userId: string, userRole: string, reason?: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can reject purchase orders');
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchaseOrder) throw new NotFoundError('Purchase order not found');

    if (purchaseOrder.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot reject a paid purchase order');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: DocumentStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Purchase order ${purchaseOrder.orderNumber} rejected by user ${userId}. Reason: ${reason || 'N/A'}`);
    return updated;
  }

  /**
   * Approve an invoice
   */
  async approveInvoice(id: string, userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can approve invoices');
    }

    const invoice = await prisma.customerInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (invoice.status === DocumentStatus.APPROVED) {
      throw new BadRequestError('Invoice is already approved');
    }

    if (invoice.status === DocumentStatus.PAID || invoice.status === DocumentStatus.CANCELLED) {
      throw new BadRequestError('Cannot approve a paid or cancelled invoice');
    }

    const updated = await prisma.customerInvoice.update({
      where: { id },
      data: {
        status: DocumentStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        salesOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Invoice ${invoice.invoiceNumber} approved by user ${userId}`);
    return updated;
  }

  /**
   * Reject an invoice
   */
  async rejectInvoice(id: string, userId: string, userRole: string, reason?: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can reject invoices');
    }

    const invoice = await prisma.customerInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (invoice.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot reject a paid invoice');
    }

    const updated = await prisma.customerInvoice.update({
      where: { id },
      data: {
        status: DocumentStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        salesOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Invoice ${invoice.invoiceNumber} rejected by user ${userId}. Reason: ${reason || 'N/A'}`);
    return updated;
  }

  /**
   * Approve a vendor bill
   */
  async approveVendorBill(id: string, userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can approve vendor bills');
    }

    const vendorBill = await prisma.vendorBill.findUnique({ where: { id } });
    if (!vendorBill) throw new NotFoundError('Vendor bill not found');

    if (vendorBill.status === DocumentStatus.APPROVED) {
      throw new BadRequestError('Vendor bill is already approved');
    }

    if (vendorBill.status === DocumentStatus.PAID || vendorBill.status === DocumentStatus.CANCELLED) {
      throw new BadRequestError('Cannot approve a paid or cancelled vendor bill');
    }

    const updated = await prisma.vendorBill.update({
      where: { id },
      data: {
        status: DocumentStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Vendor bill ${vendorBill.billNumber} approved by user ${userId}`);
    return updated;
  }

  /**
   * Reject a vendor bill
   */
  async rejectVendorBill(id: string, userId: string, userRole: string, reason?: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can reject vendor bills');
    }

    const vendorBill = await prisma.vendorBill.findUnique({ where: { id } });
    if (!vendorBill) throw new NotFoundError('Vendor bill not found');

    if (vendorBill.status === DocumentStatus.PAID) {
      throw new BadRequestError('Cannot reject a paid vendor bill');
    }

    const updated = await prisma.vendorBill.update({
      where: { id },
      data: {
        status: DocumentStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, orderNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Vendor bill ${vendorBill.billNumber} rejected by user ${userId}. Reason: ${reason || 'N/A'}`);
    return updated;
  }

  /**
   * Get approval statistics for dashboard
   */
  async getApprovalStats(userId: string, userRole: string) {
    if (userRole !== 'SALES_FINANCE' && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only Sales & Finance team can access approval statistics');
    }

    const [
      pendingSalesOrders,
      pendingPurchaseOrders,
      pendingInvoices,
      pendingVendorBills,
      approvedThisMonth,
      rejectedThisMonth,
    ] = await Promise.all([
      prisma.salesOrder.count({
        where: { status: { in: [DocumentStatus.DRAFT, DocumentStatus.SENT] } },
      }),
      prisma.purchaseOrder.count({
        where: { status: { in: [DocumentStatus.DRAFT, DocumentStatus.SENT] } },
      }),
      prisma.customerInvoice.count({
        where: { status: { in: [DocumentStatus.DRAFT, DocumentStatus.SENT] } },
      }),
      prisma.vendorBill.count({
        where: { status: { in: [DocumentStatus.DRAFT, DocumentStatus.SENT] } },
      }),
      this.getApprovedCountThisMonth(),
      this.getRejectedCountThisMonth(),
    ]);

    return {
      pending: {
        total: pendingSalesOrders + pendingPurchaseOrders + pendingInvoices + pendingVendorBills,
        salesOrders: pendingSalesOrders,
        purchaseOrders: pendingPurchaseOrders,
        invoices: pendingInvoices,
        vendorBills: pendingVendorBills,
      },
      thisMonth: {
        approved: approvedThisMonth,
        rejected: rejectedThisMonth,
      },
    };
  }

  private async getApprovedCountThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [salesOrders, purchaseOrders, invoices, vendorBills] = await Promise.all([
      prisma.salesOrder.count({
        where: {
          status: DocumentStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          status: DocumentStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.customerInvoice.count({
        where: {
          status: DocumentStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.vendorBill.count({
        where: {
          status: DocumentStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    return salesOrders + purchaseOrders + invoices + vendorBills;
  }

  private async getRejectedCountThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [salesOrders, purchaseOrders, invoices, vendorBills] = await Promise.all([
      prisma.salesOrder.count({
        where: {
          status: DocumentStatus.CANCELLED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          status: DocumentStatus.CANCELLED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.customerInvoice.count({
        where: {
          status: DocumentStatus.CANCELLED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.vendorBill.count({
        where: {
          status: DocumentStatus.CANCELLED,
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    return salesOrders + purchaseOrders + invoices + vendorBills;
  }
}

export const approvalsService = new ApprovalsService();
