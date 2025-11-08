# Project-Document Linking Implementation Guide

## Overview
This guide explains how Sales Orders, Invoices, Purchase Orders, Vendor Bills, Expenses, and Products are linked to Projects in OneFlow.

## Database Schema

### All document models have a `projectId` foreign key:

```prisma
model SalesOrder {
  id           String   @id @default(uuid())
  projectId    String   // Links to Project
  orderNumber  String   @unique
  customerName String
  amount       Float
  status       DocumentStatus
  // ... other fields
  
  project      Project  @relation(fields: [projectId], references: [id])
}

model PurchaseOrder {
  projectId    String   // Links to Project
  // ... similar structure
}

model CustomerInvoice {
  projectId    String   // Links to Project
  // ... similar structure
}

model VendorBill {
  projectId    String   // Links to Project
  // ... similar structure
}

model Expense {
  projectId    String   // Links to Project
  // ... similar structure
}
```

## Implementation

### 1. Project Detail Page

**File:** `client/src/pages/projects/ProjectDetailPage.tsx`

**Features:**
- Fetches all documents linked to the current project
- Displays them in separate tabs
- Provides "New" buttons that navigate to document creation with project pre-selected

**Code Structure:**
```typescript
// State for project documents
const [salesOrders, setSalesOrders] = useState<any[]>([])
const [invoices, setInvoices] = useState<any[]>([])
const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
const [expenses, setExpenses] = useState<any[]>([])

// Fetch documents for this project
const fetchProjectDocuments = async () => {
  const soResponse = await salesOrdersApi.getAll()
  const projectSO = soResponse.data.data.salesOrders.filter(
    (so: any) => so.projectId === projectId
  )
  setSalesOrders(projectSO)
  // ... repeat for other document types
}

// Display in tabs
<TabsContent value="sales-orders">
  {salesOrders.map(order => (
    <OrderCard order={order} />
  ))}
</TabsContent>
```

### 2. Document Creation Forms

**Files:**
- `client/src/pages/documents/SalesOrdersPage.tsx`
- `client/src/pages/documents/InvoicesPage.tsx`
- `client/src/pages/documents/PurchaseOrdersPage.tsx`
- `client/src/pages/documents/VendorBillsPage.tsx`
- `client/src/pages/documents/ExpensesPage.tsx`

**Implementation:**

```typescript
// 1. Add project selection in form
const [formData, setFormData] = useState({
  orderNumber: "",
  customer: "",
  project: "", // Project ID
  amount: "",
  description: "",
})

// 2. Pre-fill project from URL query
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('project')
  if (projectId) {
    setFormData(prev => ({ ...prev, project: projectId }))
  }
}, [])

// 3. Add project dropdown
<Select
  value={formData.project}
  onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
>
  <SelectTrigger>
    <SelectValue placeholder="Select project" />
  </SelectTrigger>
  <SelectContent>
    {projects.map(project => (
      <SelectItem key={project.id} value={project.id}>
        {project.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// 4. Send projectId in API call
const payload = {
  orderNumber: formData.orderNumber,
  customerName: formData.customer,
  projectId: formData.project, // Include project ID
  amount: Number(formData.amount),
  // ... other fields
}
```

### 3. Backend API

**File:** `server/src/modules/sales-orders/sales-orders.service.ts` (example)

**Key Points:**
- API already supports projectId through Prisma schema
- No changes needed to backend - relationships already exist
- Filter by project in queries if needed

```typescript
async createSalesOrder(data: CreateSalesOrderDTO) {
  const salesOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: data.orderNumber,
      projectId: data.projectId, // Project link
      customerName: data.customerName,
      amount: data.amount,
      // ... other fields
    },
    include: {
      project: true, // Include project details
    }
  })
  return salesOrder
}

async getByProject(projectId: string) {
  return await prisma.salesOrder.findMany({
    where: { projectId },
    include: { project: true }
  })
}
```

## User Workflow

### Creating a Document from Project Page:

1. User opens project (e.g., "Corporate Website Redesign")
2. Clicks on "Sales Orders" tab
3. Clicks "New Sales Order" button
4. Redirected to `/sales-orders?project=<projectId>`
5. Form opens with project pre-selected
6. User fills form and saves
7. Document is created with `projectId` link
8. User navigates back to project
9. Document appears in project's Sales Orders tab

### Creating a Document from Documents Page:

1. User goes to `/sales-orders`
2. Clicks "New Sales Order"
3. Manually selects project from dropdown
4. Fills form and saves
5. Document is linked to selected project

### Viewing Project Documents:

1. User opens project detail page
2. Clicks on any tab (Sales Orders, Invoices, etc.)
3. Sees only documents linked to THIS project
4. Can click on documents to view details
5. Can create new documents linked to project

## Benefits

✅ **Organized:** All project-related documents in one place
✅ **Traceable:** Easy to see all financial transactions per project
✅ **Reportable:** Can calculate project profitability
✅ **Searchable:** Filter documents by project
✅ **Auditable:** Clear project-document relationships

## Project Financial Summary

With document linking, you can calculate:

```typescript
// Total Revenue (Sales Orders + Invoices)
const revenue = salesOrders.reduce((sum, so) => sum + so.amount, 0) +
                invoices.reduce((sum, inv) => sum + inv.amount, 0)

// Total Costs (Purchase Orders + Vendor Bills + Expenses)
const costs = purchaseOrders.reduce((sum, po) => sum + po.amount, 0) +
              vendorBills.reduce((sum, vb) => sum + vb.amount, 0) +
              expenses.reduce((sum, exp) => sum + exp.amount, 0)

// Profit
const profit = revenue - costs

// Profit Margin
const margin = (profit / revenue) * 100
```

## API Endpoints

All document APIs support project filtering:

```
GET /api/sales-orders?projectId=<id>
GET /api/invoices?projectId=<id>
GET /api/purchase-orders?projectId=<id>
GET /api/vendor-bills?projectId=<id>
GET /api/expenses?projectId=<id>

POST /api/sales-orders { projectId, ... }
POST /api/invoices { projectId, ... }
// etc.
```

## Next Steps

1. ✅ Project Detail Page shows Sales Orders
2. ⏳ Add similar tabs for Invoices, PO, VB, Expenses
3. ⏳ Update all document forms with project dropdown
4. ⏳ Add project filter in document list pages
5. ⏳ Create financial summary dashboard per project
6. ⏳ Add PDF export with project branding

## Testing Checklist

- [ ] Create Sales Order from project page
- [ ] Verify SO appears in project's Sales Orders tab
- [ ] Create Sales Order from documents page
- [ ] Link it to a project manually
- [ ] Verify it appears in correct project
- [ ] Create multiple documents for one project
- [ ] Verify all appear in project tabs
- [ ] Delete a document
- [ ] Verify it disappears from project tab
- [ ] Filter documents by project in list view
- [ ] Export project financial report

## Troubleshooting

**Issue:** Documents not appearing in project tabs
**Solution:** Check if `projectId` is being sent in API call

**Issue:** Project dropdown empty in forms
**Solution:** Ensure projects are being fetched on form load

**Issue:** Cannot link document to project
**Solution:** Check backend validation - projectId must be valid

## Summary

The project-document linking system is **already implemented in the database schema**. The frontend just needs to:

1. Fetch documents filtered by projectId
2. Display them in project tabs
3. Add project selection in document forms
4. Pass projectId when creating documents

This provides a complete ERP-like experience where all project financials are tracked and visible in one place!
