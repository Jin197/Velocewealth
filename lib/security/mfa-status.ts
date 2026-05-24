import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * 14-day grace period after signup before MFA becomes mandatory.
 * Picked to match common SaaS patterns (Notion uses 30d, Stripe Connect
 * uses 14d). Short enough to keep security tight, long enough that the
 * user doesn't get blocked mid-onboarding by their phone being offline.
 */
const GRACE_PERIOD_DAYS = 14;
const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export interface MfaStatus {
  /** True when the user has at least one verified TOTP factor. */
  enabled: boolean;
  /** Hard deadline; null when the user is not authenticated. */
  gracePeriodEnd: string | null;
  /** True while now() is still inside the 14-day grace window. */
  gracePeriodActive: boolean;
  /** Ceil(remaining days). 0 when grace expired. */
  daysRemaining: number;
  /** True when we should force-redirect the user to /settings/security. */
  mustEnable: boolean;
}

const ANONYMOUS: MfaStatus = {
  enabled: false,
  gracePeriodEnd: null,
  gracePeriodActive: false,
  daysRemaining: 0,
  mustEnable: false,
};

/**
 * Server-side helper: fetches the current user's MFA factor list + their
 * profile.created_at, then computes whether MFA is mandatory NOW.
 *
 * Used by:
 *   - app/[locale]/(app)/layout.tsx → enforce post-grace redirect
 *   - components/domain/mfa-banner.tsx → display countdown
 *   - components/domain/mfa-section.tsx → can fetch live status post-enroll
 *
 * Cost: 2 Supabase calls (mfa.listFactors + profile select). ~80-150ms on
 * a warm connection. Acceptable for an authenticated route check.
 */
export async function getMfaStatus(): Promise<MfaStatus> {
  if (!isSupabaseConfigured()) return ANONYMOUS;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return ANONYMOUS;

  // Detect any verified TOTP factor.
  let enabled = false;
  try {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    enabled = (factors?.totp ?? []).some((f) => f.status === 'verified');
  } catch {
    // Shouldn't normally fail, but never block the page on a transient error.
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', user.id)
    .single();

  const createdAtStr = (profile?.created_at as string | undefined) ?? null;
  const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
  const gracePeriodEnd = new Date(createdAt.getTime() + GRACE_PERIOD_MS);
  const now = new Date();
  const gracePeriodActive = now < gracePeriodEnd;
  const daysRemaining = gracePeriodActive
    ? Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  return {
    enabled,
    gracePeriodEnd: gracePeriodEnd.toISOString(),
    gracePeriodActive,
    daysRemaining,
    mustEnable: !enabled && !gracePeriodActive,
  };
}

export { GRACE_PERIOD_DAYS };
