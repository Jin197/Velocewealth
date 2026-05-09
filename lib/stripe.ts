import 'server-only';
import Stripe from 'stripe';
import { env } from '@/lib/env';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecret(), {
      // Pinned API version. Cast bypasses the strict literal-union of LatestApiVersion
      // which evolves in the SDK; revisit on each Stripe SDK upgrade.
      apiVersion: '2024-11-20.acacia' as never,
      typescript: true,
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
