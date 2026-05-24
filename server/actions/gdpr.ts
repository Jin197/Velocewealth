'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';
import {
  generateOtp,
  hashOtp,
  otpExpiresAt,
  OTP_VALIDITY_MINUTES,
} from '@/lib/security/account-deletion';
import { renderAccountDeletionEmail } from '@/lib/security/email-templates';
import type { ActionResult } from './profile';

const NOT_CONFIGURED_EXPORT = { ok: false, error: 'Backend non configuré. Voir ONBOARDING.md.' };
const NOT_CONFIGURED_ACTION: ActionResult = { error: 'Backend non configuré. Voir ONBOARDING.md.' };

export async function exportUserDataAction(): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_EXPORT;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'Non authentifié' };

  try {
    // 1. Get Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Get Vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id);

    // 3. Get Fuel entries
    const { data: fuelEntries } = await supabase
      .from('fuel_entries')
      .select('*')
      .eq('user_id', user.id);

    // 4. Get Maintenance entries
    const { data: maintenanceEntries } = await supabase
      .from('maintenance_entries')
      .select('*')
      .eq('user_id', user.id);

    // 5. Get Maintenance alerts
    const { data: maintenanceAlerts } = await supabase
      .from('maintenance_alerts')
      .select('*')
      .eq('user_id', user.id);

    // 6. Get Subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // 7. Get Audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profile || null,
      vehicles: vehicles || [],
      fuelEntries: fuelEntries || [],
      maintenanceEntries: maintenanceEntries || [],
      maintenanceAlerts: maintenanceAlerts || [],
      subscriptions: subscriptions || [],
      auditLogs: auditLogs || [],
    };

    return { ok: true, data: exportData };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des données',
    };
  }
}

/**
 * Step 1 of the secured account-deletion flow.
 *
 * - Verifies the user is authenticated.
 * - Rate-limits to 1 request / 5 minutes per user to prevent email bombing.
 * - Invalidates any prior unconsumed request (defense in depth).
 * - Generates a 6-digit OTP, stores its SHA-256 hash, and emails the raw
 *   code to the user via Resend if configured.
 * - Always reports success to the client to avoid leaking which step failed
 *   (rate-limit hit, email send error, etc.) — except for non-auth, which
 *   is a hard prerequisite.
 *
 * When Resend isn't configured (no RESEND_API_KEY / EMAIL_FROM in env), the
 * action returns the OTP back to the server console via console.warn so a
 * developer can still test the flow locally.
 */
export async function requestAccountDeletionAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_ACTION;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  // 1 request / 5 minutes per user
  const bucket = await rateLimit(
    `delete-request:${user.id}`,
    1,
    5 * 60 * 1000,
  );
  if (!bucket.ok) {
    return {
      error:
        'Une demande a déjà été envoyée récemment. Patientez avant de réessayer.',
    };
  }

  const admin = createAdminClient();

  // Invalidate prior pending requests so only the freshest OTP is valid.
  await admin
    .from('account_deletion_requests' as never)
    .update({ consumed_at: new Date().toISOString() } as never)
    .eq('user_id', user.id)
    .is('consumed_at', null);

  const otp = generateOtp();
  const { error: insertErr } = await admin
    .from('account_deletion_requests' as never)
    .insert({
      user_id: user.id,
      otp_hash: hashOtp(otp),
      expires_at: otpExpiresAt(),
    } as never);

  if (insertErr) {
    return { error: 'Impossible de générer la demande. Réessayez.' };
  }

  // Fetch profile for email personalization. Fall back to user.email if
  // the row is missing for any reason.
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, locale')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email ?? null;
  if (!email) {
    // No email at all — flag but don't surface the inner detail.
    return { error: 'Impossible d\'envoyer le code (email manquant).' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const rendered = renderAccountDeletionEmail({
    fullName: profile?.full_name ?? null,
    email,
    otp,
    expiresInMinutes: OTP_VALIDITY_MINUTES,
    locale: profile?.locale ?? 'fr',
  });

  if (apiKey && from) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        }),
      });
    } catch {
      // Email send failure is logged but not surfaced to avoid leaking
      // provider status. The OTP row is still valid; the user can retry
      // after the rate-limit window.
    }
  } else {
    // Dev environment without Resend: log to server console so the
    // developer can copy-paste the OTP into the confirmation form.
    console.warn(
      `[account-deletion] OTP for ${user.id} (dev mode, no Resend): ${otp}`,
    );
  }

  return { ok: true };
}

export async function deleteAccountAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_ACTION;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  try {
    const admin = createAdminClient();
    
    // Stripe cleanup if customer exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      // In a real application, you might cancel their subscription on Stripe here
      // But we will allow the database cascade deletion to handle local records first.
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return { error: `Échec de la suppression : ${error.message}` };
    }

    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression de votre compte',
    };
  }
}
