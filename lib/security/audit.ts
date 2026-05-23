import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';

export type AuthAuditAction =
  | 'login_success'
  | 'login_failed'
  | 'login_rate_limited'
  | 'mfa_challenge_success'
  | 'mfa_challenge_failed'
  | 'mfa_enrolled'
  | 'mfa_disabled'
  | 'password_changed'
  | 'signup_blocked_breach';

interface AuditAuthOptions {
  /** Supabase auth user id, or null if event has no associated user (e.g. failed login for unknown email). */
  userId: string | null;
  action: AuthAuditAction;
  ip: string;
  userAgent: string;
  /** Hashed email — never store raw email in logs for GDPR data minimization. */
  emailHash?: string;
  /** Extra context: error code, mfa method, breach count, etc. */
  metadata?: Record<string, unknown>;
}

/**
 * Append-only insert into `auth_audit_logs`. We use the admin client because
 * failed-login events have no authenticated session (RLS would reject the row).
 * Fails silently — auditing must never break the user-facing flow.
 */
export async function auditAuthEvent(opts: AuditAuthOptions): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from('auth_audit_logs' as never).insert({
      user_id: opts.userId,
      action: opts.action,
      ip: opts.ip === '0.0.0.0' ? null : opts.ip,
      user_agent: opts.userAgent,
      email_hash: opts.emailHash ?? null,
      metadata: opts.metadata ?? {},
    } as never);
  } catch {
    // Audit failures must not block authentication.
  }
}
