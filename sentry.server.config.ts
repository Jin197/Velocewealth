import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? 'development',
    tracesSampleRate: 0.1,
    spotlight: process.env.NODE_ENV === 'development',
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      // Drop request body for sensitive endpoints
      if (event.request?.url?.includes('/api/stripe/webhook')) {
        delete event.request.data;
      }
      return event;
    },
  });
}
