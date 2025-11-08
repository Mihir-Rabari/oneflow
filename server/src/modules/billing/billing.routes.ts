import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { UserRole } from '@oneflow/shared';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

// Authorization for write operations (create/update/delete)
const writeAuth = authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.SALES_FINANCE);

// ===== Sales Orders =====
router.get('/sales-orders', billingController.getSalesOrders.bind(billingController));
router.get('/sales-orders/:id', billingController.getSalesOrderById.bind(billingController));
router.post('/sales-orders', writeAuth, billingController.createSalesOrder.bind(billingController));
router.patch('/sales-orders/:id', writeAuth, billingController.updateSalesOrder.bind(billingController));
router.delete('/sales-orders/:id', writeAuth, billingController.deleteSalesOrder.bind(billingController));

// ===== Purchase Orders =====
router.get('/purchase-orders', billingController.getPurchaseOrders.bind(billingController));
router.get('/purchase-orders/:id', billingController.getPurchaseOrderById.bind(billingController));
router.post('/purchase-orders', writeAuth, billingController.createPurchaseOrder.bind(billingController));
router.patch('/purchase-orders/:id', writeAuth, billingController.updatePurchaseOrder.bind(billingController));
router.delete('/purchase-orders/:id', writeAuth, billingController.deletePurchaseOrder.bind(billingController));

// ===== Customer Invoices =====
router.get('/invoices', billingController.getInvoices.bind(billingController));
router.get('/invoices/:id', billingController.getInvoiceById.bind(billingController));
router.post('/invoices', writeAuth, billingController.createInvoice.bind(billingController));
router.patch('/invoices/:id', writeAuth, billingController.updateInvoice.bind(billingController));
router.delete('/invoices/:id', writeAuth, billingController.deleteInvoice.bind(billingController));

// ===== Vendor Bills =====
router.get('/vendor-bills', billingController.getVendorBills.bind(billingController));
router.get('/vendor-bills/:id', billingController.getVendorBillById.bind(billingController));
router.post('/vendor-bills', writeAuth, billingController.createVendorBill.bind(billingController));
router.patch('/vendor-bills/:id', writeAuth, billingController.updateVendorBill.bind(billingController));
router.delete('/vendor-bills/:id', writeAuth, billingController.deleteVendorBill.bind(billingController));

export default router;
