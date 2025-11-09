import Redis from 'ioredis';
import { env } from './env';
import { logger } from '@/utils/logger';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy(times: number) {
    if (times > 10) {
      logger.error('❌ Redis max retries reached, giving up');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error: Error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('🎯 Redis is ready to accept commands');
});

// Cache service for general caching with improved strategy
export const cacheService = {
  // Get cached value
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      
      // Try to parse JSON, return raw string if fails
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  },

  // Set cache with TTL
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      logger.debug(`Cache set: ${key} (TTL: ${ttl || 'none'})`);
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
    }
  },

  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const deleted = await redis.del(...keys);
      logger.debug(`Cache deleted ${deleted} keys matching: ${pattern}`);
      return deleted;
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error);
      return 0;
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  },

  // Get TTL of a key
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  },

  // Increment counter
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttl && value === 1) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error(`Error incrementing cache key ${key}:`, error);
      return 0;
    }
  },

  // Get multiple keys
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await redis.mget(...keys);
    } catch (error) {
      logger.error(`Error getting multiple cache keys:`, error);
      return [];
    }
  },

  // Get keys by pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  },

  // Hash operations for complex data
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redis.hset(key, field, stringValue);
    } catch (error) {
      logger.error(`Error setting hash ${key}.${field}:`, error);
    }
  },

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    try {
      const value = await redis.hget(key, field);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Error getting hash ${key}.${field}:`, error);
      return null;
    }
  },

  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    try {
      const data = await redis.hgetall(key);
      if (Object.keys(data).length === 0) return null;
      return data as T;
    } catch (error) {
      logger.error(`Error getting all hash ${key}:`, error);
      return null;
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

// OTP service - stores OTPs with 600 second (10 minute) TTL
export const otpService = {
  OTP_TTL: 600, // 10 minutes in seconds

  // Store OTP in Redis with 600 second expiry
  async storeOTP(email: string, otp: string, type: string = 'email_verification'): Promise<void> {
    const key = `otp:${type}:${email}`;
    await redis.setex(key, this.OTP_TTL, JSON.stringify({ otp, email, type, createdAt: new Date().toISOString() }));
    logger.info(`OTP stored for ${email} (type: ${type}) with ${this.OTP_TTL}s TTL`);
  },

  // Retrieve OTP from Redis
  async getOTP(email: string, type: string = 'email_verification'): Promise<{ otp: string; createdAt: string } | null> {
    const key = `otp:${type}:${email}`;
    const data = await redis.get(key);
    
    if (!data) {
      logger.debug(`No OTP found for ${email} (type: ${type})`);
      return null;
    }
    
    try {
      const parsed = JSON.parse(data);
      return { otp: parsed.otp, createdAt: parsed.createdAt };
    } catch {
      return null;
    }
  },

  // Verify and delete OTP (one-time use)
  async verifyAndDeleteOTP(email: string, otp: string, type: string = 'email_verification'): Promise<boolean> {
    const stored = await this.getOTP(email, type);
    
    if (!stored || stored.otp !== otp) {
      logger.warn(`OTP verification failed for ${email} (type: ${type})`);
      return false;
    }
    
    // Delete OTP after successful verification
    await this.deleteOTP(email, type);
    logger.info(`OTP verified and deleted for ${email} (type: ${type})`);
    return true;
  },

  // Delete OTP manually
  async deleteOTP(email: string, type: string = 'email_verification'): Promise<void> {
    const key = `otp:${type}:${email}`;
    await redis.del(key);
  },

  // Get remaining TTL for an OTP
  async getOTPTTL(email: string, type: string = 'email_verification'): Promise<number> {
    const key = `otp:${type}:${email}`;
    return await redis.ttl(key);
  },

  // Check if OTP exists
  async otpExists(email: string, type: string = 'email_verification'): Promise<boolean> {
    const key = `otp:${type}:${email}`;
    const exists = await redis.exists(key);
    return exists === 1;
  },

  // Invalidate all OTPs for an email
  async invalidateAllOTPs(email: string): Promise<number> {
    const keys = await redis.keys(`otp:*:${email}`);
    if (keys.length === 0) return 0;
    
    const deleted = await redis.del(...keys);
    logger.info(`Invalidated ${deleted} OTPs for ${email}`);
    return deleted;
  },

  // Get OTP attempts counter (for rate limiting)
  async incrementAttempts(email: string, type: string = 'email_verification'): Promise<number> {
    const key = `otp_attempts:${type}:${email}`;
    const attempts = await redis.incr(key);
    
    // Set TTL on first attempt
    if (attempts === 1) {
      await redis.expire(key, this.OTP_TTL);
    }
    
    return attempts;
  },

  // Get current attempt count
  async getAttempts(email: string, type: string = 'email_verification'): Promise<number> {
    const key = `otp_attempts:${type}:${email}`;
    const attempts = await redis.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  },

  // Reset attempts counter
  async resetAttempts(email: string, type: string = 'email_verification'): Promise<void> {
    const key = `otp_attempts:${type}:${email}`;
    await redis.del(key);
  },
};

export default redis;
export { redis };
