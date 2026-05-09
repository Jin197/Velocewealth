/**
 * Centralised env access. Throws lazily — only when a server action / route
 * actually needs the variable, so the build keeps working without a .env.local.
 */
function required(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(
      `Missing environment variable ${key}. See .env.example for setup.`,
    );
  }
  return v;
}

export const env = {
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  supabaseUrl: () => required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: () => required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  stripeSecret: () => required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => required('STRIPE_WEBHOOK_SECRET'),
  stripePriceMonthly: () => required('STRIPE_PRICE_MONTHLY'),
  stripePriceYearly: () => required('STRIPE_PRICE_YEARLY'),
  googleVisionCredentials: () => required('GOOGLE_APPLICATION_CREDENTIALS_JSON'),
};

export const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
