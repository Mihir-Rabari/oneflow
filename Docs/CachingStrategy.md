# OneFlow Caching Strategy

## Overview

OneFlow implements a comprehensive Redis-based caching strategy to optimize performance, reduce database load, and improve user experience. The caching system is built on `ioredis` with specialized services for different use cases.

---

## 🚀 Cache Services

### 1. **General Cache Service** (`cacheService`)

For generic key-value caching with automatic JSON serialization.

#### Key Features
- **Automatic JSON Handling**: Serializes/deserializes objects automatically
- **TTL Support**: Set expiration times for cache entries
- **Pattern Deletion**: Delete multiple keys matching a pattern
- **Increment Counters**: Atomic counter operations
- **Hash Operations**: Store complex nested data structures
- **Multi-get**: Fetch multiple keys in one operation

#### Usage Examples

```typescript
import { cacheService } from '@/config/redis';

// Store user data for 1 hour
await cacheService.set('user:123', { id: 123, name: 'John' }, 3600);

// Retrieve user data
const user = await cacheService.get<User>('user:123');

// Delete all user caches
await cacheService.delPattern('user:*');

// Store in hash
await cacheService.hset('project:456', 'name', 'OneFlow');
await cacheService.hset('project:456', 'status', 'active');

// Get hash field
const name = await cacheService.hget('project:456', 'name');

// Get all hash fields
const project = await cacheService.hgetall('project:456');
```

---

### 2. **Session Service** (`sessionService`)

For user authentication session management.

#### Configuration
- **TTL**: 15 minutes (900 seconds) for access tokens
- **Key Pattern**: `session:{userId}:{token}`
- **Storage**: JWT token + user metadata

#### Features
- Store JWT sessions with automatic expiry
- Retrieve active sessions
- Delete specific sessions (logout)
- Delete all user sessions (force logout all devices)

#### Usage Examples

```typescript
import { sessionService } from '@/config/redis';

// Store session (15 minutes)
await sessionService.setSession(userId, accessToken, 900);

// Check session validity
const session = await sessionService.getSession(userId, accessToken);

// Logout (delete session)
await sessionService.deleteSession(userId, accessToken);

// Force logout from all devices
await sessionService.deleteAllUserSessions(userId);
```

---

### 3. **OTP Service** (`otpService`) ⭐

Dedicated service for OTP management with **600 second (10 minute) TTL**.

#### Configuration
- **TTL**: 600 seconds (10 minutes) - configurable via `otpService.OTP_TTL`
- **Key Pattern**: `otp:{type}:{email}`
- **Types**: `email_verification`, `password_reset`
- **One-Time Use**: OTPs are deleted after successful verification

#### Features
- ✅ Store OTP with automatic 600s expiry
- ✅ Retrieve OTP with creation timestamp
- ✅ Verify and auto-delete OTP (one-time use)
- ✅ Check OTP existence and remaining TTL
- ✅ Invalidate all OTPs for an email
- ✅ Track verification attempts (rate limiting)
- ✅ Comprehensive logging for security auditing

#### Usage Examples

```typescript
import { otpService } from '@/config/redis';

// Store OTP for email verification (expires in 600s)
await otpService.storeOTP('user@example.com', '123456', 'email_verification');

// Retrieve OTP
const stored = await otpService.getOTP('user@example.com', 'email_verification');
console.log(stored); // { otp: '123456', createdAt: '2024-11-08T...' }

// Verify OTP (auto-deletes on success)
const isValid = await otpService.verifyAndDeleteOTP('user@example.com', '123456', 'email_verification');

// Check remaining time
const ttl = await otpService.getOTPTTL('user@example.com', 'email_verification');
console.log(`OTP expires in ${ttl} seconds`);

// Track failed attempts
const attempts = await otpService.incrementAttempts('user@example.com', 'email_verification');
if (attempts > 5) {
  throw new Error('Too many attempts');
}

// Invalidate all OTPs for user
await otpService.invalidateAllOTPs('user@example.com');
```

---

## 📊 Caching Patterns

### 1. **Cache-Aside (Lazy Loading)**

Load data from cache, fetch from DB if missing, then cache it.

```typescript
async function getUser(userId: string) {
  // Try cache first
  const cached = await cacheService.get<User>(`user:${userId}`);
  if (cached) return cached;

  // Fetch from database
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Cache for 1 hour
  await cacheService.set(`user:${userId}`, user, 3600);
  
  return user;
}
```

### 2. **Write-Through**

Update cache immediately when database is updated.

```typescript
async function updateUser(userId: string, data: UpdateUserDTO) {
  // Update database
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // Update cache
  await cacheService.set(`user:${userId}`, user, 3600);

  return user;
}
```

### 3. **Cache Invalidation**

Delete cache when data changes.

```typescript
async function deleteUser(userId: string) {
  // Delete from database
  await prisma.user.delete({ where: { id: userId } });

  // Invalidate cache
  await cacheService.del(`user:${userId}`);
  await sessionService.deleteAllUserSessions(userId);
}
```

---

## 🔐 Security Best Practices

### OTP Security
1. **Short TTL**: OTPs expire after 600 seconds (10 minutes)
2. **One-Time Use**: OTPs are deleted after successful verification
3. **Attempt Limiting**: Track failed attempts to prevent brute force
4. **Type Separation**: Different OTP types stored separately
5. **Comprehensive Logging**: All OTP operations are logged

### Session Security
1. **Short-Lived Tokens**: Access tokens expire in 15 minutes
2. **Refresh Tokens**: Long-lived refresh tokens for token renewal
3. **Force Logout**: Ability to invalidate all sessions
4. **Token Rotation**: New tokens issued on refresh

---

## 📈 Performance Optimizations

### 1. **Database Query Reduction**
- Cache frequently accessed data (users, projects)
- Reduce database load by 60-80%

### 2. **Response Time Improvement**
- Redis in-memory operations: <1ms
- Database queries: 10-100ms
- **Last Updated**: November 8, 2025

### 3. **Rate Limiting**
- Use Redis counters for API rate limiting
- Track OTP attempts
- Prevent abuse

### 4. **Session Management**
- Fast session validation without DB queries
- Automatic cleanup via TTL
- Scalable across multiple servers

---

## 🎯 Recommended TTL Values

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| **OTPs** | 600s (10 min) | Security: short-lived, one-time use |
| **Sessions** | 900s (15 min) | Balance between UX and security |
| **User Data** | 3600s (1 hour) | Frequently accessed, rarely changes |
| **Project Data** | 1800s (30 min) | Moderate access, moderate changes |
| **Task Lists** | 300s (5 min) | Frequently updated |
| **Analytics** | 7200s (2 hours) | Expensive to compute, updates slowly |
| **Rate Limits** | 60-3600s | Depends on limit window |

---

## 🛠️ Monitoring & Debugging

### Redis Metrics Available
```typescript
// Check if key exists
const exists = await cacheService.exists('user:123');

// Get TTL of a key
const ttl = await cacheService.ttl('user:123');

// Get all keys matching pattern
const keys = await cacheService.keys('user:*');
```

### Logging
All cache operations are logged at appropriate levels:
- `info`: Important operations (OTP stored, session created)
- `debug`: Routine operations (cache hit/miss)
- `warn`: Security events (OTP verification failed)
- `error`: Failures (Redis connection error)

---

## 🚨 Error Handling

All cache operations have error handling that:
1. Logs errors without crashing the app
2. Returns safe defaults (null, empty array, false)
3. Allows the app to fall back to database if Redis fails

```typescript
// Example: graceful degradation
try {
  const cached = await cacheService.get('user:123');
  if (cached) return cached;
} catch (error) {
  logger.warn('Cache failed, falling back to DB');
}

// Always fetch from DB as fallback
return await prisma.user.findUnique({ where: { id: '123' } });
```

---

## 📋 Migration Checklist

- [x] Redis client configured with retry strategy
- [x] Cache service with JSON serialization
- [x] Session service for JWT management
- [x] OTP service with 600s TTL
- [x] Error handling and logging
- [x] Type safety with TypeScript generics
- [x] Pattern-based cache invalidation
- [x] Hash operations for complex data
- [x] Counter operations for rate limiting

---

## 🔮 Future Enhancements

1. **Redis Cluster**: For high availability and scalability
2. **Cache Warming**: Pre-load frequently accessed data
3. **Pub/Sub**: Real-time notifications across servers
4. **Redis Streams**: Event sourcing and audit logs
5. **Sorted Sets**: Leaderboards and rankings
6. **Geo Operations**: Location-based features

---

## 📝 Notes

- All OTPs are stored in Redis, not in PostgreSQL database
- This reduces database load and improves performance
- OTPs automatically expire after 600 seconds
- No manual cleanup needed due to Redis TTL
- Session tokens are validated against Redis first, then database
- Cache keys follow consistent naming patterns for easy management
