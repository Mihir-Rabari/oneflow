console.log('=== SERVER STARTUP BEGIN ===');

import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';

console.log('=== Imports loaded ===');
console.log('PORT from env:', env.PORT);

const PORT = env.PORT || 4000;

console.log('=== Final PORT:', PORT, '===');

async function startServer() {
  try {
    logger.info('🔄 Starting server initialization...');
    logger.info(`📍 Port: ${PORT}`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    
    // Connect to database
    logger.info('🔄 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connection step completed');

    // Test Redis connection
    logger.info('🔄 Testing Redis connection...');
    await redis.ping();
    logger.info('✅ Redis ping successful');

    // Start server
    logger.info('🔄 Starting HTTP server...');
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`❤️  Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await disconnectDatabase();

        // Close Redis connection
        await redis.quit();
        logger.info('Redis connection closed');

        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
