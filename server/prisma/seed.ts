import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.expense.deleteMany();
  await prisma.vendorBill.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create 5 employees
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@oneflow.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'John Manager',
      email: 'john@oneflow.com',
      password: hashedPassword,
      role: 'PROJECT_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Engineering',
      hourlyRate: 75,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Sarah Lead',
      email: 'sarah@oneflow.com',
      password: hashedPassword,
      role: 'PROJECT_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Design',
      hourlyRate: 70,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Mike Developer',
      email: 'mike@oneflow.com',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Engineering',
      hourlyRate: 60,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Emma Designer',
      email: 'emma@oneflow.com',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Design',
      hourlyRate: 55,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Robert Sales',
      email: 'sales@oneflow.com',
      password: hashedPassword,
      role: 'SALES_FINANCE',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Sales',
      hourlyRate: 65,
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: 'Lisa Finance',
      email: 'finance@oneflow.com',
      password: hashedPassword,
      role: 'SALES_FINANCE',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Finance',
      hourlyRate: 65,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Alice QA',
      email: 'alice@oneflow.com',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'QA',
      hourlyRate: 50,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Bob DevOps',
      email: 'bob@oneflow.com',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'DevOps',
      hourlyRate: 60,
    },
  });

  const dev5 = await prisma.user.create({
    data: {
      name: 'Diana UX',
      email: 'diana@oneflow.com',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      department: 'Design',
      hourlyRate: 55,
    },
  });

  console.log(`✅ Created 10 users (1 Admin, 2 PMs, 5 Team Members, 2 Sales/Finance)`);

  // Create 3 projects
  console.log('📁 Creating projects...');

  // Today is Nov 9, 2025 - use realistic dates
  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with Next.js and Stripe integration',
      type: 'TIME_AND_MATERIAL',
      status: 'IN_PROGRESS',
      budget: 50000,
      spent: 15000,
      revenue: 20000,
      profit: 5000,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-02-28'),
      deadline: new Date('2026-02-15'),
      progress: 35,
      projectManagerId: pm1.id,
      clientName: 'Tech Retail Inc',
      clientEmail: 'contact@techretail.com',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      description: 'iOS and Android app for digital banking services',
      type: 'FIXED_PRICE',
      status: 'IN_PROGRESS',
      budget: 80000,
      spent: 25000,
      revenue: 40000,
      profit: 15000,
      startDate: new Date('2025-09-15'),
      endDate: new Date('2026-03-30'),
      deadline: new Date('2026-03-15'),
      progress: 45,
      projectManagerId: pm2.id,
      clientName: 'FinTech Solutions',
      clientEmail: 'dev@fintech.com',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Corporate Website Redesign',
      description: 'Complete redesign of corporate website with new branding',
      type: 'RETAINER',
      status: 'PLANNED',
      budget: 25000,
      spent: 0,
      revenue: 0,
      profit: 0,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-04-30'),
      deadline: new Date('2026-04-15'),
      progress: 0,
      projectManagerId: pm1.id,
      clientName: 'Global Corp',
      clientEmail: 'marketing@globalcorp.com',
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'CRM System',
      description: 'Custom CRM with lead management and analytics',
      type: 'TIME_AND_MATERIAL',
      status: 'IN_PROGRESS',
      budget: 120000,
      spent: 45000,
      revenue: 72000,
      profit: 27000,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-01-31'),
      deadline: new Date('2026-01-15'),
      progress: 60,
      projectManagerId: pm2.id,
      clientName: 'Sales Pro Inc',
      clientEmail: 'it@salespro.com',
    },
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'Marketing Automation',
      description: 'Email marketing automation platform',
      type: 'FIXED_PRICE',
      status: 'COMPLETED',
      budget: 80000,
      spent: 30000,
      revenue: 80000,
      profit: 50000,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-10-31'),
      deadline: new Date('2025-10-15'),
      progress: 100,
      projectManagerId: pm1.id,
      clientName: 'Marketing Hub',
      clientEmail: 'dev@markethub.com',
    },
  });

  console.log(`✅ Created 5 projects (3 IN_PROGRESS, 1 PLANNED, 1 COMPLETED)`);

  // Add team members to projects
  console.log('👨‍💻 Adding team members to projects...');

  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: dev1.id },
      { projectId: project1.id, userId: dev2.id },
      { projectId: project1.id, userId: dev3.id },
      { projectId: project2.id, userId: dev1.id },
      { projectId: project2.id, userId: dev4.id },
      { projectId: project3.id, userId: dev2.id },
      { projectId: project3.id, userId: dev5.id },
      { projectId: project4.id, userId: dev1.id },
      { projectId: project4.id, userId: dev3.id },
      { projectId: project5.id, userId: dev2.id },
      { projectId: project5.id, userId: dev4.id },
    ],
  });

  console.log(`✅ Added team members to projects`);

  // Create tasks
  console.log('📝 Creating tasks...');

  await prisma.task.create({
    data: {
      title: 'Setup project repository',
      description: 'Initialize Git repo and CI/CD pipeline',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project1.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
      startDate: new Date('2025-10-01'),
      dueDate: new Date('2025-10-05'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Design product catalog UI',
      description: 'Create mockups for product listing and details pages',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project1.id,
      assignedToId: dev2.id,
      createdById: pm1.id,
      startDate: new Date('2025-10-03'),
      dueDate: new Date('2025-10-10'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement payment gateway',
      description: 'Integrate Stripe for payment processing',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project1.id,
      assignedToId: dev1.id,
      createdById: pm1.id,
      startDate: new Date('2025-11-05'),
      dueDate: new Date('2025-11-25'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'User authentication module',
      description: 'Implement JWT-based authentication',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project2.id,
      assignedToId: dev1.id,
      createdById: pm2.id,
      startDate: new Date('2025-09-20'),
      dueDate: new Date('2025-10-05'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Transaction history screen',
      description: 'Design and implement transaction list view',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      projectId: project2.id,
      assignedToId: dev2.id,
      createdById: pm2.id,
      startDate: new Date('2025-11-01'),
      dueDate: new Date('2025-11-20'),
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Research design trends',
      description: 'Research current web design trends for redesign',
      status: 'NEW',
      priority: 'MEDIUM',
      projectId: project3.id,
      assignedToId: dev2.id,
      createdById: pm1.id,
      dueDate: new Date('2025-12-15'),
    },
  });

  const task1 = await prisma.task.findFirst({ where: { title: 'Setup project repository' } });
  const task2 = await prisma.task.findFirst({ where: { title: 'Design product catalog UI' } });
  const task3 = await prisma.task.findFirst({ where: { title: 'Implement payment gateway' } });
  const task4 = await prisma.task.findFirst({ where: { title: 'User authentication module' } });
  const task5 = await prisma.task.findFirst({ where: { title: 'Transaction history screen' } });

  console.log(`✅ Created 6 tasks (3 Done, 2 In Progress, 1 New)`);

  // Create timesheets
  console.log('⏰ Creating timesheets...');

  await prisma.timesheet.createMany({
    data: [
      {
        userId: dev1.id,
        projectId: project1.id,
        taskId: task3!.id,
        date: new Date('2025-11-06'),
        hours: 8,
        description: 'Payment gateway integration',
        isBillable: true,
      },
      {
        userId: dev1.id,
        projectId: project1.id,
        taskId: task3!.id,
        date: new Date('2025-11-07'),
        hours: 6,
        description: 'Stripe webhook setup',
        isBillable: true,
      },
      {
        userId: dev2.id,
        projectId: project1.id,
        taskId: task2!.id,
        date: new Date('2025-10-08'),
        hours: 7,
        description: 'UI design and styling',
        isBillable: true,
      },
      {
        userId: dev1.id,
        projectId: project2.id,
        taskId: task4!.id,
        date: new Date('2025-10-01'),
        hours: 8,
        description: 'Auth API development',
        isBillable: true,
      },
      {
        userId: dev2.id,
        projectId: project2.id,
        taskId: task5!.id,
        date: new Date('2025-11-05'),
        hours: 5,
        description: 'Transaction UI design',
        isBillable: true,
      },
    ],
  });

  console.log(`✅ Created 5 timesheet entries`);

  // Create Sales Orders
  console.log('💰 Creating sales orders...');
  await prisma.salesOrder.createMany({
    data: [
      { orderNumber: 'SO-2025-0001', projectId: project1.id, customerName: 'Tech Retail Inc', amount: 50000, status: 'SENT', orderDate: new Date('2025-10-01'), createdById: sales.id },
      { orderNumber: 'SO-2025-0002', projectId: project1.id, customerName: 'Tech Retail Inc', amount: 50000, status: 'SENT', orderDate: new Date('2025-11-01'), createdById: sales.id },
      { orderNumber: 'SO-2025-0003', projectId: project2.id, customerName: 'FinTech Solutions', amount: 150000, status: 'SENT', orderDate: new Date('2025-09-15'), createdById: sales.id },
      { orderNumber: 'SO-2025-0004', projectId: project4.id, customerName: 'Sales Pro Inc', amount: 120000, status: 'SENT', orderDate: new Date('2025-08-01'), createdById: finance.id },
    ],
  });
  console.log(`✅ Created 4 sales orders`);

  // Create Expenses
  console.log('💳 Creating expenses...');
  await prisma.expense.createMany({
    data: [
      { description: 'Client meeting travel', amount: 1500, category: 'TRAVEL', status: 'APPROVED', expenseDate: new Date('2025-11-01'), projectId: project1.id, userId: dev1.id, isBillable: true, approvedById: pm1.id },
      { description: 'Development tools license', amount: 2000, category: 'EQUIPMENT', status: 'APPROVED', expenseDate: new Date('2025-10-15'), projectId: project1.id, userId: dev1.id, isBillable: false, approvedById: pm1.id },
      { description: 'Design software subscription', amount: 500, category: 'SOFTWARE', status: 'PENDING', expenseDate: new Date('2025-11-05'), projectId: project2.id, userId: dev2.id, isBillable: false },
    ],
  });
  console.log(`✅ Created 3 expenses`);

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 10 Users (1 Admin, 2 PMs, 5 Team Members, 2 Sales/Finance)`);
  console.log(`   - 5 Projects (3 IN_PROGRESS, 1 PLANNED, 1 COMPLETED)`);
  console.log(`   - 6 Tasks (3 Done, 2 In Progress, 1 New)`);
  console.log(`   - 5 Timesheet Entries (34 hours total)`);
  console.log(`   - 4 Sales Orders (₹370,000 revenue)`);
  console.log(`   - 3 Expenses (₹4,000)\n`);
  console.log('🔑 Login credentials (Password: Password123! for all):');
  console.log(`   Admin:    admin@oneflow.com`);
  console.log(`   PM:       john@oneflow.com | sarah@oneflow.com`);
  console.log(`   Team:     mike@oneflow.com | emma@oneflow.com | alice@oneflow.com`);
  console.log(`   Finance:  sales@oneflow.com | finance@oneflow.com`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
