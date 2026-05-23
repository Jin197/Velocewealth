import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simple unit tests for Stripe price resolving logic
describe('Stripe pricing plan resolving utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_PRICE_MONTHLY: 'price_premium_mo',
      STRIPE_PRICE_YEARLY: 'price_premium_yr',
      STRIPE_PRICE_FAMILY_MONTHLY: 'price_family_mo',
      STRIPE_PRICE_FAMILY_YEARLY: 'price_family_yr',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Pure functions/decisions replica test from Stripe webhook
  function getTierFromPriceId(priceId: string): 'premium' | 'family' {
    const familyMonthly = process.env.STRIPE_PRICE_FAMILY_MONTHLY;
    const familyYearly = process.env.STRIPE_PRICE_FAMILY_YEARLY;
    return priceId === familyMonthly || priceId === familyYearly ? 'family' : 'premium';
  }

  function getPlanTier(status: string, tier: 'premium' | 'family'): 'free' | 'premium' | 'family' {
    return status === 'active' || status === 'trialing' ? tier : 'free';
  }

  it('maps monthly and yearly family Stripe price IDs to family tier', () => {
    expect(getTierFromPriceId('price_family_mo')).toBe('family');
    expect(getTierFromPriceId('price_family_yr')).toBe('family');
  });

  it('maps monthly and yearly premium Stripe price IDs to premium tier', () => {
    expect(getTierFromPriceId('price_premium_mo')).toBe('premium');
    expect(getTierFromPriceId('price_premium_yr')).toBe('premium');
  });

  it('defaults to premium if price ID is unknown or empty', () => {
    expect(getTierFromPriceId('unknown')).toBe('premium');
  });

  it('resolves active and trialing status to actual sub tier', () => {
    expect(getPlanTier('active', 'family')).toBe('family');
    expect(getPlanTier('trialing', 'family')).toBe('family');
    expect(getPlanTier('active', 'premium')).toBe('premium');
  });

  it('resolves canceled, past_due, and unpaid status to free', () => {
    expect(getPlanTier('canceled', 'family')).toBe('free');
    expect(getPlanTier('past_due', 'family')).toBe('free');
    expect(getPlanTier('unpaid', 'premium')).toBe('free');
  });
});
