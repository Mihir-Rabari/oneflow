import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function wipeDatabase() {
  console.log('\n⚠️  WARNING: DATABASE WIPE OPERATION ⚠️\n');
  console.log('This will DELETE ALL DATA from the database!');
  console.log('This action CANNOT be undone!\n');

  const confirmation = await question('Type "WIPE DATABASE" to confirm: ');

  if (confirmation !== 'WIPE DATABASE') {
    console.log('\n❌ Operation cancelled. Database was not wiped.');
    rl.close();
    process.exit(0);
  }

  const doubleConfirm = await question('\nAre you absolutely sure? Type "YES" to proceed: ');

  if (doubleConfirm !== 'YES') {
    console.log('\n❌ Operation cancelled. Database was not wiped.');
    rl.close();
    process.exit(0);
  }

  console.log('\n🔄 Starting database wipe...\n');

  try {
    // Delete in order of dependencies (child tables first)
    console.log('Deleting timesheets...');
    await prisma.timesheet.deleteMany({});

    console.log('Deleting expenses...');
    await prisma.expense.deleteMany({});

    console.log('Deleting vendor bills...');
    await prisma.vendorBill.deleteMany({});

    console.log('Deleting customer invoices...');
    await prisma.customerInvoice.deleteMany({});

    console.log('Deleting purchase orders...');
    await prisma.purchaseOrder.deleteMany({});

    console.log('Deleting sales orders...');
    await prisma.salesOrder.deleteMany({});

    console.log('Deleting tasks...');
    await prisma.task.deleteMany({});

    console.log('Deleting projects...');
    await prisma.project.deleteMany({});

    console.log('Deleting OTPs...');
    await prisma.oTP.deleteMany({});

    console.log('Deleting users...');
    await prisma.user.deleteMany({});

    console.log('\n✅ Database wiped successfully!');
    console.log('\n📊 Summary:');
    console.log('- All users deleted');
    console.log('- All projects deleted');
    console.log('- All tasks deleted');
    console.log('- All timesheets deleted');
    console.log('- All financial documents deleted');
    console.log('- All activity logs deleted');
    console.log('\nDatabase is now empty and ready for fresh data.');
  } catch (error) {
    console.error('\n❌ Error wiping database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

wipeDatabase();
