import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing, locales } from '@/lib/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PREFIXES = [
  'dashboard',
  'vehicles',
  'fuel',
  'maintenance',
  'map',
  'eco-score',
  'settings',
];
const AUTH_ONLY_PATHS = ['login', 'signup', 'forgot-password'];

/**
 * Strip the leading /<locale>/ from a path so we can compare semantically.
 * "/en/dashboard" → "dashboard"; "/dashboard" → "dashboard".
 */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && (locales as readonly string[]).includes(segments[0])) {
    return segments.slice(1).join('/');
  }
  return segments.join('/');
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const stripped = stripLocale(path);
  const firstSeg = stripped.split('/')[0] ?? '';

  // Auth-aware routes get Supabase session refresh + redirect logic
  const isProtected = PROTECTED_PREFIXES.includes(firstSeg);
  const isAuthOnly = AUTH_ONLY_PATHS.includes(firstSeg);

  if (isProtected || isAuthOnly) {
    // Run Supabase first to get/refresh session and possibly redirect.
    const authResponse = await updateSession(request);
    if (authResponse.headers.get('location')) {
      return authResponse;
    }
    // Then run i18n on the same request to add locale prefix if needed.
    return intlMiddleware(request);
  }

  // Public routes: only run i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip API, auth callback, _next, static files
    '/((?!api|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
