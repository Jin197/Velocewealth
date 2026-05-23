import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';

const DEVICE_COOKIE = 'velo_device';
const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 days
const TOKEN_BYTES = 32; // 256-bit random

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function deriveLabel(userAgent: string): string {
  // Best-effort label from common UA fragments; refined by user in settings.
  const ua = userAgent.toLowerCase();
  const os = ua.includes('mac os')
    ? 'Mac'
    : ua.includes('windows')
      ? 'Windows'
      : ua.includes('iphone')
        ? 'iPhone'
        : ua.includes('ipad')
          ? 'iPad'
          : ua.includes('android')
            ? 'Android'
            : ua.includes('linux')
              ? 'Linux'
              : 'Appareil';
  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('firefox')
      ? 'Firefox'
      : ua.includes('chrome')
        ? 'Chrome'
        : ua.includes('safari')
          ? 'Safari'
          : 'navigateur';
  return `${os} · ${browser}`;
}

/**
 * Returns true when the current browser presents a cookie tied to an
 * existing (non-revoked) trusted_devices row for this user. Used to
 * suppress "new device login" emails on familiar devices.
 */
export async function isCurrentDeviceTrusted(
  userId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const raw = cookies().get(DEVICE_COOKIE)?.value;
  if (!raw) return false;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('trusted_devices' as never)
      .select('id')
      .eq('user_id', userId)
      .eq('token_hash', hashToken(raw))
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Issue a fresh device token for this browser after a successful login.
 * Stores the hash server-side, drops the raw value in an httpOnly cookie
 * so the same browser is recognized at the next login.
 *
 * Safe to call repeatedly — if a token already exists we update
 * last_seen_at + last_ip + last_user_agent instead of inserting again.
 */
export async function rememberDevice(opts: {
  userId: string;
  ip: string;
  userAgent: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const existing = cookies().get(DEVICE_COOKIE)?.value;
    const admin = createAdminClient();

    if (existing) {
      const tokenHash = hashToken(existing);
      const { data: row } = await admin
        .from('trusted_devices' as never)
        .select('id')
        .eq('user_id', opts.userId)
        .eq('token_hash', tokenHash)
        .is('revoked_at', null)
        .limit(1)
        .maybeSingle();
      if (row) {
        await admin
          .from('trusted_devices' as never)
          .update({
            last_seen_at: new Date().toISOString(),
            last_ip: opts.ip === '0.0.0.0' ? null : opts.ip,
            last_user_agent: opts.userAgent,
          } as never)
          .eq('id', (row as { id: string }).id);
        return;
      }
    }

    // First time on this browser (or cookie was wiped) — issue a new token.
    const raw = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const tokenHash = hashToken(raw);

    await admin.from('trusted_devices' as never).insert({
      user_id: opts.userId,
      token_hash: tokenHash,
      label: deriveLabel(opts.userAgent),
      last_ip: opts.ip === '0.0.0.0' ? null : opts.ip,
      last_user_agent: opts.userAgent,
    } as never);

    cookies().set(DEVICE_COOKIE, raw, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch {
    // Never break login because of a device-tracking miss.
  }
}
