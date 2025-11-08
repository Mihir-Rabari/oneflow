import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
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

  console.log(`✅ Created 5 users`);

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

  console.log(`✅ Created 3 projects (2 IN_PROGRESS, 1 PLANNED)`);

  // Add team members to projects
  console.log('👨‍💻 Adding team members to projects...');

  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: dev1.id },
      { projectId: project1.id, userId: dev2.id },
      { projectId: project2.id, userId: dev1.id },
      { projectId: project2.id, userId: dev2.id },
      { projectId: project3.id, userId: dev2.id },
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

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 5 Users (1 Admin, 2 Project Managers, 2 Team Members)`);
  console.log(`   - 3 Projects (2 IN_PROGRESS, 1 PLANNED)`);
  console.log(`   - 6 Tasks (3 Done, 2 In Progress, 1 Todo)`);
  console.log(`   - 5 Timesheet Entries (34 hours total)\n`);
  console.log('🔑 Login credentials:');
  console.log(`   Email: admin@oneflow.com | Password: Password123!`);
  console.log(`   Email: john@oneflow.com  | Password: Password123!`);
  console.log(`   Email: sarah@oneflow.com | Password: Password123!`);
  console.log(`   Email: mike@oneflow.com  | Password: Password123!`);
  console.log(`   Email: emma@oneflow.com  | Password: Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
