import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { auditAuthEvent } from '@/lib/security/audit';
import { notifyNewDeviceLoginIfNeeded } from '@/lib/security/login-notifications';
import {
  isCurrentDeviceTrusted,
  rememberDevice,
} from '@/lib/security/trusted-devices';
import {
  getClientIp,
  getUserAgent,
  hashEmail,
} from '@/lib/security/request-context';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  const oauthErrorCode = url.searchParams.get('error_code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  // ── Provider returned an explicit error (user cancelled, expired flow_state, …).
  // Forward a short, stable error key to /login so the UI can show a clear toast.
  if (oauthError) {
    const errKey =
      oauthErrorCode === 'flow_state_already_used'
        ? 'oauth_replay'
        : oauthErrorCode === 'flow_state_expired'
          ? 'oauth_expired'
          : 'oauth_failed';
    return NextResponse.redirect(
      new URL(`/login?error=${errKey}`, request.url),
    );
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const ip = getClientIp();
      const userAgent = getUserAgent();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile in one shot for locale cookie sync + new-device email.
        const { data: profile } = await supabase
          .from('profiles')
          .select('locale, email, full_name')
          .eq('id', user.id)
          .single();

        if (profile?.locale) {
          cookies().set('NEXT_LOCALE', profile.locale, {
            path: '/',
            maxAge: 365 * 24 * 60 * 60,
            sameSite: 'lax',
          });
        }

        // ── Mirror what loginAction does for email/password:
        // audit log, new-device email (if not on a trusted browser),
        // and stamp the trusted_devices cookie for next time.
        // Identifies which provider was used via the user's identities.
        const provider =
          user.app_metadata?.provider ??
          user.identities?.[0]?.provider ??
          'unknown';

        await auditAuthEvent({
          userId: user.id,
          action: 'login_success',
          ip,
          userAgent,
          emailHash: user.email ? hashEmail(user.email) : undefined,
          metadata: { provider, oauth: true },
        });

        const deviceTrusted = await isCurrentDeviceTrusted(user.id);
        const notifyEmail = profile?.email ?? user.email ?? null;
        if (notifyEmail && !deviceTrusted) {
          await notifyNewDeviceLoginIfNeeded({
            userId: user.id,
            email: notifyEmail,
            fullName: profile?.full_name ?? null,
            locale: profile?.locale ?? 'fr',
            ip,
            userAgent,
          });
        }

        await rememberDevice({ userId: user.id, ip, userAgent });
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
    // Exchange itself failed (expired code, already consumed, signature mismatch).
    return NextResponse.redirect(
      new URL('/login?error=oauth_exchange', request.url),
    );
  }

  return NextResponse.redirect(new URL('/login?error=auth', request.url));
}
