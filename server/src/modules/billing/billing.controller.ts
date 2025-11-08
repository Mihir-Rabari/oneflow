import { Request, Response, NextFunction } from 'express';
import { salesOrdersService } from './sales-orders.service';
import { purchaseOrdersService } from './purchase-orders.service';
import { invoicesService } from './invoices.service';
import { vendorBillsService } from './vendor-bills.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class BillingController {
  // ===== Sales Orders =====
  async createSalesOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const salesOrder = await salesOrdersService.createSalesOrder(
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.status(201).json({ success: true, data: salesOrder });
    } catch (error) {
      next(error);
    }
  }

  async getSalesOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const salesOrders = await salesOrdersService.getSalesOrders(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: salesOrders });
    } catch (error) {
      next(error);
    }
  }

  async getSalesOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const salesOrder = await salesOrdersService.getSalesOrderById(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: salesOrder });
    } catch (error) {
      next(error);
    }
  }

  async updateSalesOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const salesOrder = await salesOrdersService.updateSalesOrder(
        (req as any).params.id,
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: salesOrder });
    } catch (error) {
      next(error);
    }
  }

  async deleteSalesOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await salesOrdersService.deleteSalesOrder(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ===== Purchase Orders =====
  async createPurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchaseOrder = await purchaseOrdersService.createPurchaseOrder(
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.status(201).json({ success: true, data: purchaseOrder });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const purchaseOrders = await purchaseOrdersService.getPurchaseOrders(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: purchaseOrders });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchaseOrder = await purchaseOrdersService.getPurchaseOrderById(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: purchaseOrder });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchaseOrder = await purchaseOrdersService.updatePurchaseOrder(
        (req as any).params.id,
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: purchaseOrder });
    } catch (error) {
      next(error);
    }
  }

  async deletePurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await purchaseOrdersService.deletePurchaseOrder(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ===== Customer Invoices =====
  async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoicesService.createInvoice((req as any).body, req.user!.id, req.user!.role);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const invoices = await invoicesService.getInvoices(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoicesService.getInvoiceById(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoicesService.updateInvoice(
        (req as any).params.id,
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await invoicesService.deleteInvoice((req as any).params.id, req.user!.id, req.user!.role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ===== Vendor Bills =====
  async createVendorBill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorBill = await vendorBillsService.createVendorBill((req as any).body, req.user!.id, req.user!.role);
      res.status(201).json({ success: true, data: vendorBill });
    } catch (error) {
      next(error);
    }
  }

  async getVendorBills(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const vendorBills = await vendorBillsService.getVendorBills(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: vendorBills });
    } catch (error) {
      next(error);
    }
  }

  async getVendorBillById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorBill = await vendorBillsService.getVendorBillById(
        (req as any).params.id,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: vendorBill });
    } catch (error) {
      next(error);
    }
  }

  async updateVendorBill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorBill = await vendorBillsService.updateVendorBill(
        (req as any).params.id,
        (req as any).body,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: vendorBill });
    } catch (error) {
      next(error);
    }
  }

  async deleteVendorBill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await vendorBillsService.deleteVendorBill((req as any).params.id, req.user!.id, req.user!.role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
