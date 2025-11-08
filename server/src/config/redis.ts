import Redis from 'ioredis';
import { env } from './env';
import { logger } from '@/utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('Redis is ready to accept commands');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Cache utilities
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, data);
      } else {
        await redis.set(key, data);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },
};

// Session utilities
export const sessionService = {
  async setSession(userId: string, token: string, ttl: number): Promise<void> {
    await redis.setex(`session:${userId}:${token}`, ttl, JSON.stringify({ userId, token }));
  },

  async getSession(userId: string, token: string): Promise<any> {
    const data = await redis.get(`session:${userId}:${token}`);
    return data ? JSON.parse(data) : null;
  },

  async deleteSession(userId: string, token: string): Promise<void> {
    await redis.del(`session:${userId}:${token}`);
  },

  async deleteAllUserSessions(userId: string): Promise<void> {
    const keys = await redis.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

export default redis;
