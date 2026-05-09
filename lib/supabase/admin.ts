import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

/**
 * Service-role client. Bypasses RLS — use ONLY for:
 *  - Stripe webhook (no user session)
 *  - Background jobs
 *  - Admin operations
 * NEVER expose this client to a route handler that takes user input directly
 * without first verifying the requester's identity.
 */
export function createAdminClient() {
  return createClient<Database>(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
