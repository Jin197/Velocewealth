/**
 * Simple in-memory rate limiter. Fine for low traffic + single-instance Vercel.
 * For production scale, swap for Upstash Redis (rest API works on Edge).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetIn: number } {
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
