import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Server-side logout endpoint.
 *
 * Why a route handler instead of just calling logoutAction:
 *   1. Lets us set `Clear-Site-Data: "cookies", "storage", "cache"` in the
 *      response, which the browser honors by wiping localStorage,
 *      sessionStorage, IndexedDB, the BFCache, and all cookies of this origin.
 *   2. Pairs with the middleware's `Cache-Control: no-store` on protected
 *      routes — together they make the browser back button useless for
 *      reaching authenticated UI after logout.
 *
 * The form-action pattern (POST → 303 redirect) avoids CSRF concerns: the
 * browser only follows the redirect, and same-site cookies guarantee the
 * caller is our own page.
 */
export async function POST(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    // signOut invalidates the refresh token server-side (Supabase) AND
    // clears the auth cookies via our SSR client helper.
    await supabase.auth.signOut();
  }

  const url = new URL('/login', req.url);
  const response = NextResponse.redirect(url, { status: 303 });

  // Tell the browser to wipe everything tied to this origin.
  response.headers.set(
    'Clear-Site-Data',
    '"cookies", "storage", "cache"',
  );
  // Defense-in-depth: no-store on the redirect itself so it never sticks
  // in any intermediate cache.
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0',
  );
  response.headers.set('Pragma', 'no-cache');

  return response;
}
