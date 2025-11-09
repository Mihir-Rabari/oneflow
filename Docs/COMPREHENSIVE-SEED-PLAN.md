# Comprehensive Database Seed Plan

## 🎯 Objective
Create a COMPLETE database seed with realistic, interconnected data for the OneFlow hackathon demo.

## 📊 Data to be Seeded

### 1. Users (10 users across all roles)
```
✅ 1 Admin
✅ 2 Project Managers
✅ 2 Team Members  
🆕 2 Sales/Finance users
🆕 3 Additional team members (Designer, QA, DevOps)
```

**Credentials:** All users password = `Password123!`

| Email | Role | Name |
|-------|------|------|
| admin@oneflow.com | ADMIN | Admin User |
| john@oneflow.com | PROJECT_MANAGER | John Manager |
| sarah@oneflow.com | PROJECT_MANAGER | Sarah Lead |
| mike@oneflow.com | TEAM_MEMBER | Mike Developer |
| emma@oneflow.com | TEAM_MEMBER | Emma Designer |
| sales@oneflow.com | SALES_FINANCE | Robert Sales |
| finance@oneflow.com | SALES_FINANCE | Lisa Finance |
| alice@oneflow.com | TEAM_MEMBER | Alice QA |
| bob@oneflow.com | TEAM_MEMBER | Bob DevOps |
| diana@oneflow.com | TEAM_MEMBER | Diana UX |

### 2. Projects (5 projects - various statuses)
```
✅ E-Commerce Platform (IN_PROGRESS - 35%)
✅ Mobile Banking App (IN_PROGRESS - 45%)
✅ Corporate Website Redesign (PLANNED - 0%)
🆕 CRM System (IN_PROGRESS - 60%)
🆕 Marketing Automation (COMPLETED - 100%)
```

### 3. Tasks (20+ tasks with various statuses)
```
Per project:
- 4-6 tasks each
- Mix of NEW, IN_PROGRESS, BLOCKED, DONE
- Different priorities (LOW, MEDIUM, HIGH, URGENT)
- Assigned to different team members
```

### 4. Task Comments (30+ comments)
```
🆕 Multiple comments per task
🆕 From different users (PM, team members)
🆕 Realistic discussion threads
```

### 5. Products (10 products/services)
```
🆕 Software Development Services
🆕 UI/UX Design
🆕 Project Management
🆕 QA Testing
🆕 DevOps Setup
🆕 Cloud Hosting
🆕 Database Setup
🆕 API Integration
🆕 Mobile Development
🆕 Consulting Hours
```

### 6. Sales Orders (8 orders)
```
🆕 2 per active project
🆕 Different statuses (DRAFT, SENT, APPROVED)
🆕 Linked to projects
🆕 Realistic amounts (₹50K - ₹150K)
```

### 7. Purchase Orders (6 orders)
```
🆕 For vendor services/products
🆕 Cloud hosting, licenses, equipment
🆕 Linked to projects
🆕 Amounts: ₹5K - ₹50K
```

### 8. Customer Invoices (10 invoices)
```
🆕 Linked to Sales Orders
🆕 Milestone-based invoicing
🆕 Different statuses (DRAFT, SENT, PAID)
🆕 Payment tracking
```

### 9. Vendor Bills (8 bills)
```
🆕 From Purchase Orders
🆕 AWS, Google Cloud, licenses
🆕 Recurring and one-time
🆕 Due dates and payment status
```

### 10. Expenses (12 expenses)
```
🆕 Team member submissions
🆕 Travel, meals, equipment
🆕 Billable and non-billable
🆕 Approved and pending
🆕 Receipts (simulated)
```

### 11. Timesheets (50+ entries)
```
✅ Already have 5
🆕 Add 45 more entries
🆕 Cover 2-3 weeks of work
🆕 Different team members
🆕 Billable and non-billable hours
```

## 💰 Financial Summary After Seed

**Project 1 - E-Commerce Platform:**
- Revenue: ₹100,000 (2 Sales Orders)
- Costs: ₹35,000 (PO + Expenses)
- Profit: ₹65,000

**Project 2 - Mobile Banking App:**
- Revenue: ₹150,000  
- Costs: ₹55,000
- Profit: ₹95,000

**Project 3 - Corporate Website:**
- Revenue: ₹50,000
- Costs: ₹15,000  
- Profit: ₹35,000

**Project 4 - CRM System:**
- Revenue: ₹120,000
- Costs: ₹45,000
- Profit: ₹75,000

**Project 5 - Marketing Automation (Completed):**
- Revenue: ₹80,000
- Costs: ₹30,000
- Profit: ₹50,000

**TOTAL:**
- Revenue: ₹500,000
- Costs: ₹180,000
- **Net Profit: ₹320,000 (64% margin)**

## 🔄 Execution Plan

### Phase 1: Clear Database
```bash
npm run db:reset  # Wipes everything
```

### Phase 2: Run Enhanced Seed
```bash
npm run db:seed   # Runs comprehensive seed.ts
```

### Phase 3: Verify
```bash
# Check counts
- Users: 10
- Projects: 5  
- Tasks: 25+
- Comments: 30+
- Products: 10
- Sales Orders: 8
- Purchase Orders: 6
- Invoices: 10
- Vendor Bills: 8
- Expenses: 12
- Timesheets: 50+
```

## 📝 Seed Script Structure

```typescript
async function main() {
  // 1. Clear all data
  await clearDatabase();
  
  // 2. Create users (all roles)
  const users = await createUsers();
  
  // 3. Create products/services
  const products = await createProducts();
  
  // 4. Create projects
  const projects = await createProjects(users);
  
  // 5. Assign team members
  await assignTeamMembers(projects, users);
  
  // 6. Create tasks
  const tasks = await createTasks(projects, users);
  
  // 7. Add task comments
  await createTaskComments(tasks, users);
  
  // 8. Create Sales Orders
  const salesOrders = await createSalesOrders(projects, users);
  
  // 9. Create Customer Invoices
  await createCustomerInvoices(salesOrders, projects, users);
  
  // 10. Create Purchase Orders
  const purchaseOrders = await createPurchaseOrders(projects, users);
  
  // 11. Create Vendor Bills
  await createVendorBills(purchaseOrders, projects, users);
  
  // 12. Create Expenses
  await createExpenses(projects, users);
  
  // 13. Create Timesheets
  await createTimesheets(tasks, projects, users);
  
  // 14. Print summary
  printSummary();
}
```

## 🎭 Realistic Scenarios

### Scenario 1: Fixed-Price Project (Mobile Banking)
1. Sales Order: ₹150,000 (Customer purchase)
2. Milestone 1 Invoice: ₹50,000 (Paid)
3. Milestone 2 Invoice: ₹50,000 (Sent)
4. Milestone 3 Invoice: ₹50,000 (Draft)
5. Purchase Order: AWS hosting ₹15,000
6. Vendor Bill: AWS monthly ₹5,000
7. Expenses: Team travel ₹3,000
8. Timesheets: 250 hours logged

### Scenario 2: Time & Material (E-Commerce)
1. Sales Order 1: ₹50,000 (Approved)
2. Sales Order 2: ₹50,000 (Draft - ongoing)
3. Invoice 1: ₹50,000 for first month (Paid)
4. Purchase Order: Stripe integration license ₹10,000
5. Expenses: Development tools ₹2,000
6. Timesheets: 180 hours logged

### Scenario 3: Retainer (Corporate Website)
1. Sales Order: ₹50,000 (Monthly retainer)
2. Invoice: ₹50,000/month (Recurring)
3. Purchase Order: Stock photos ₹5,000
4. Expenses: Designer travel ₹1,500
5. Timesheets: 120 hours logged

## ✅ Success Criteria

After seeding, each role should see:

**Admin:**
- 10 users across all roles
- 5 projects with full financial data
- System-wide stats and health

**Project Manager (John):**
- 2-3 projects they manage
- Full task visibility for their projects
- Ability to approve expenses
- Financial overview per project

**Team Member (Mike):**
- Only tasks assigned to them (8-10 tasks)
- Their timesheet entries (20+ hours)
- Their expense submissions (2-3)
- No access to create projects

**Sales/Finance (Robert):**
- All Sales Orders (8)
- All Invoices (10)
- All Purchase Orders (6)
- All Vendor Bills (8)
- Financial reports and summaries

## 🚀 Commands

```bash
# Reset and seed database
cd server
npm run db:reset && npm run db:seed

# Check database
npx prisma studio

# Test application
npm run dev
```

## 📌 Notes

- All dates are realistic (Oct 2025 - Present)
- All amounts follow Indian currency format
- All relationships are properly linked
- Task dependencies respected
- Financial calculations accurate
- Real-world business flow
