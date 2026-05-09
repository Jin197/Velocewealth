import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co';

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.mapbox.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com;
  img-src 'self' blob: data: https://images.unsplash.com https://*.mapbox.com https://${SUPABASE_HOST};
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.stripe.com https://api.mapbox.com https://events.mapbox.com https://*.ingest.sentry.io https://o*.ingest.sentry.io;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.stripe.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const config = withNextIntl(nextConfig);

// Conditionally wrap with Sentry if DSN is configured.
// Without DSN, the app builds and runs without Sentry overhead.
let exported = config;
if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_AUTH_TOKEN) {
  try {
    const { withSentryConfig } = await import('@sentry/nextjs');
    exported = withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    });
  } catch {
    // Sentry SDK not available — skip silently
  }
}

export default exported;
