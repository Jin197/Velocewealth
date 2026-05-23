import { headers } from 'next/headers';
import crypto from 'crypto';

/**
 * Extract the client IP from common forwarded headers. Vercel sets
 * `x-forwarded-for` and `x-real-ip`; we take the first IP if multiple are
 * comma-separated (the chain is `<client>, <proxy1>, <proxy2>`).
 *
 * Falls back to '0.0.0.0' in dev where headers may be missing.
 */
export function getClientIp(): string {
  const h = headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = h.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}

/** Browser user-agent string, capped to avoid bloating audit logs. */
export function getUserAgent(): string {
  const ua = headers().get('user-agent') ?? 'unknown';
  return ua.slice(0, 255);
}

/**
 * Hash an email so we can rate-limit per identity without storing the raw
 * email in Redis keys. Lowercased + trimmed first for case-insensitive match.
 */
export function hashEmail(email: string): string {
  return crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);
}
