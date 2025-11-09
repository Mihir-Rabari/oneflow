import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    if (e.duration > 1000) {
      logger.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
    }
  });
}

export const connectDatabase = async () => {
  try {
    logger.info('Attempting database connection...');
    
    // Add timeout to prevent hanging
    const connectWithTimeout = Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 10s')), 10000)
      )
    ]);
    
    await connectWithTimeout;
    logger.info('✅ Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database query test successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    logger.error('Check if PostgreSQL is running and DATABASE_URL is correct');
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

export { prisma };
