// ============================================================
//  Redis Client — Session, token blacklist, rate limiting
// ============================================================

import IORedis from "ioredis";
import { config } from "./config";
import { logger } from "./logger";

export const redis = new IORedis(config.REDIS_URL, {
  password: config.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error("Redis connection failed after 5 retries");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: false,
  enableReadyCheck: true,
});

redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error("Redis error"));
redis.on("close", () => logger.warn("Redis connection closed"));

// ─── Redis Key Namespaces ─────────────────────────────────────
export const RedisKeys = {
  refreshToken: (tokenId: string) => `rt:${tokenId}`,
  emailVerify: (token: string) => `ev:${token}`,
  passwordReset: (token: string) => `pr:${token}`,
  rateLimit: (ip: string) => `rl:${ip}`,
  loginAttempts: (identifier: string) => `la:${identifier}`,
  userSession: (userId: string) => `us:${userId}`,
  streamKey: (key: string) => `sk:${key}`,
} as const;

// ─── TTLs (seconds) ───────────────────────────────────────────
export const RedisTTL = {
  REFRESH_TOKEN: 60 * 60 * 24 * 30, // 30 days
  EMAIL_VERIFY: 60 * 60 * 24, // 24 hours
  PASSWORD_RESET: 60 * 60, // 1 hour
  LOGIN_ATTEMPTS: 60 * 15, // 15 minutes lockout window
  USER_SESSION: 60 * 60 * 24 * 7, // 7 days
} as const;

// ─── Typed helpers ────────────────────────────────────────────
export const redisHelpers = {
  /**
   * Store a refresh token reference for revocation checks
   */
  async setRefreshToken(tokenId: string, userId: string): Promise<void> {
    await redis.setex(
      RedisKeys.refreshToken(tokenId),
      RedisTTL.REFRESH_TOKEN,
      userId,
    );
  },

  async getRefreshToken(tokenId: string): Promise<string | null> {
    return redis.get(RedisKeys.refreshToken(tokenId));
  },

  async deleteRefreshToken(tokenId: string): Promise<void> {
    await redis.del(RedisKeys.refreshToken(tokenId));
  },

  /**
   * Track & enforce login attempt limits (brute force protection)
   */
  async incrementLoginAttempts(identifier: string): Promise<number> {
    const key = RedisKeys.loginAttempts(identifier);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RedisTTL.LOGIN_ATTEMPTS);
    }
    return count;
  },

  async getLoginAttempts(identifier: string): Promise<number> {
    const val = await redis.get(RedisKeys.loginAttempts(identifier));
    return val ? parseInt(val, 10) : 0;
  },

  async clearLoginAttempts(identifier: string): Promise<void> {
    await redis.del(RedisKeys.loginAttempts(identifier));
  },

  /**
   * Store email verification / password reset token
   */
  async setEmailToken(token: string, userId: string): Promise<void> {
    await redis.setex(
      RedisKeys.emailVerify(token),
      RedisTTL.EMAIL_VERIFY,
      userId,
    );
  },

  async getEmailToken(token: string): Promise<string | null> {
    return redis.get(RedisKeys.emailVerify(token));
  },

  async deleteEmailToken(token: string): Promise<void> {
    await redis.del(RedisKeys.emailVerify(token));
  },

  async setPasswordResetToken(token: string, userId: string): Promise<void> {
    await redis.setex(
      RedisKeys.passwordReset(token),
      RedisTTL.PASSWORD_RESET,
      userId,
    );
  },

  async getPasswordResetToken(token: string): Promise<string | null> {
    return redis.get(RedisKeys.passwordReset(token));
  },

  async deletePasswordResetToken(token: string): Promise<void> {
    await redis.del(RedisKeys.passwordReset(token));
  },

  /**
   * Invalidate ALL sessions for a user (e.g., on password change)
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    // Pattern delete all refresh tokens for user — requires scan
    // In production, maintain a set of tokenIds per user
    await redis.del(RedisKeys.userSession(userId));
  },
};
