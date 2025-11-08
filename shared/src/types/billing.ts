export enum DocumentStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED',
}

// Sales Order
export interface SalesOrder {
  id: string;
  orderNumber: string;
  projectId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  description?: string;
  status: DocumentStatus;
  orderDate: Date;
  validUntil?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalesOrderDTO {
  projectId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  description?: string;
  orderDate: Date;
  validUntil?: Date;
}

// Purchase Order
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  projectId: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  description?: string;
  status: DocumentStatus;
  orderDate: Date;
  expectedDelivery?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseOrderDTO {
  projectId: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  description?: string;
  orderDate: Date;
  expectedDelivery?: Date;
}

// Customer Invoice
export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  salesOrderId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  tax?: number;
  totalAmount: number;
  description?: string;
  status: DocumentStatus;
  invoiceDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerInvoiceDTO {
  projectId: string;
  salesOrderId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  tax?: number;
  description?: string;
  invoiceDate: Date;
  dueDate?: Date;
}

// Vendor Bill
export interface VendorBill {
  id: string;
  billNumber: string;
  projectId: string;
  purchaseOrderId?: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  tax?: number;
  totalAmount: number;
  description?: string;
  status: DocumentStatus;
  billDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorBillDTO {
  projectId: string;
  purchaseOrderId?: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  tax?: number;
  description?: string;
  billDate: Date;
  dueDate?: Date;
}

// Expense
export interface Expense {
  id: string;
  projectId: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  isBillable: boolean;
  status: ExpenseStatus;
  expenseDate: Date;
  receiptUrl?: string;
  approvedById?: string;
  approvedAt?: Date;
  reimbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDTO {
  projectId: string;
  amount: number;
  description: string;
  category: string;
  isBillable: boolean;
  expenseDate: Date;
  receiptUrl?: string;
}

export interface UpdateExpenseDTO {
  amount?: number;
  description?: string;
  category?: string;
  isBillable?: boolean;
  expenseDate?: Date;
  receiptUrl?: string;
}
