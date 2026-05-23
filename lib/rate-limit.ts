/**
 * Simple in-memory rate limiter. Fine for low traffic + single-instance Vercel.
 * For production scale, swap for Upstash Redis (rest API works on Edge).
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  // Ignorer les erreurs d'initialisation de Redis en local
}

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; remaining: number; resetIn: number }> {
  if (redis) {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redis.incr(redisKey);
      
      if (count === 1) {
        await redis.pexpire(redisKey, windowMs);
        return { ok: true, remaining: limit - 1, resetIn: windowMs };
      }
      
      const ttl = await redis.pttl(redisKey);
      const resetIn = ttl > 0 ? ttl : windowMs;
      
      if (count > limit) {
        return { ok: false, remaining: 0, resetIn };
      }
      
      return { ok: true, remaining: limit - count, resetIn };
    } catch {
      // Fallback silencieux vers le store en mémoire si Redis échoue
    }
  }

  // Fallback en mémoire locale
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetIn: windowMs };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { ok: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}
