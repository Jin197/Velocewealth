import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';
import { env } from '@/lib/env';

/**
 * Server-side Supabase client. Use in:
 *  - Server Components (page.tsx, layout.tsx)
 *  - Server Actions
 *  - Route Handlers
 *
 * Reads/writes auth cookies via Next 14 cookies() API so SSR sees the user.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Middleware handles refresh, so this is safe to ignore.
        }
      },
    },
  });
}

/** Returns the authenticated user or null. Never throws. */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Throws redirect if not authenticated — for use at top of protected pages. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  return user!;
}
