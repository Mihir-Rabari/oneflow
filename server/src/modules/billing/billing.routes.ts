import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { UserRole } from '@oneflow/shared';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

// All billing routes are restricted to ADMIN and PROJECT_MANAGER
router.use(authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER));

// ===== Sales Orders =====
router.post('/sales-orders', billingController.createSalesOrder.bind(billingController));
router.get('/sales-orders', billingController.getSalesOrders.bind(billingController));
router.get('/sales-orders/:id', billingController.getSalesOrderById.bind(billingController));
router.patch('/sales-orders/:id', billingController.updateSalesOrder.bind(billingController));
router.delete('/sales-orders/:id', billingController.deleteSalesOrder.bind(billingController));

// ===== Purchase Orders =====
router.post('/purchase-orders', billingController.createPurchaseOrder.bind(billingController));
router.get('/purchase-orders', billingController.getPurchaseOrders.bind(billingController));
router.get('/purchase-orders/:id', billingController.getPurchaseOrderById.bind(billingController));
router.patch('/purchase-orders/:id', billingController.updatePurchaseOrder.bind(billingController));
router.delete('/purchase-orders/:id', billingController.deletePurchaseOrder.bind(billingController));

// ===== Customer Invoices =====
router.post('/invoices', billingController.createInvoice.bind(billingController));
router.get('/invoices', billingController.getInvoices.bind(billingController));
router.get('/invoices/:id', billingController.getInvoiceById.bind(billingController));
router.patch('/invoices/:id', billingController.updateInvoice.bind(billingController));
router.delete('/invoices/:id', billingController.deleteInvoice.bind(billingController));

// ===== Vendor Bills =====
router.post('/vendor-bills', billingController.createVendorBill.bind(billingController));
router.get('/vendor-bills', billingController.getVendorBills.bind(billingController));
router.get('/vendor-bills/:id', billingController.getVendorBillById.bind(billingController));
router.patch('/vendor-bills/:id', billingController.updateVendorBill.bind(billingController));
router.delete('/vendor-bills/:id', billingController.deleteVendorBill.bind(billingController));

export default router;
