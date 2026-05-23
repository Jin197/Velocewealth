import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

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
      // Sync NEXT_LOCALE cookie from the user's profile so the post-OAuth
      // session resumes in their preferred language. Works for returning
      // users and for brand-new Google/Apple signups (the handle_new_user
      // trigger seeds profiles.locale from auth metadata or defaults to 'fr').
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('locale')
          .eq('id', user.id)
          .single();
        if (profile?.locale) {
          cookies().set('NEXT_LOCALE', profile.locale, {
            path: '/',
            maxAge: 365 * 24 * 60 * 60,
            sameSite: 'lax',
          });
        }
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
