import { describe, it, expect } from 'vitest';
import { isTrialActive } from '@/lib/data';

describe('isTrialActive (14-day free reverse trial)', () => {
  it('should return true for a user who signed up less than 14 days ago (J-1)', () => {
    // 1 day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isTrialActive(oneDayAgo, 'free')).toBe(true);
    expect(isTrialActive(oneDayAgo.toISOString(), 'free')).toBe(true);
  });

  it('should return false for a user who signed up exactly 14 days ago (J+14)', () => {
    // Exactly 14 days ago
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(isTrialActive(fourteenDaysAgo, 'free')).toBe(false);
    expect(isTrialActive(fourteenDaysAgo.toISOString(), 'free')).toBe(false);
  });

  it('should return false for a user who signed up 15 days ago (J+15)', () => {
    // 15 days ago
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(isTrialActive(fifteenDaysAgo, 'free')).toBe(false);
    expect(isTrialActive(fifteenDaysAgo.toISOString(), 'free')).toBe(false);
  });

  it('should return false if plan tier is already premium or family', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isTrialActive(oneDayAgo, 'premium')).toBe(false);
    expect(isTrialActive(oneDayAgo, 'family')).toBe(false);
  });

  it('should return false if createdAt date is missing', () => {
    expect(isTrialActive(undefined, 'free')).toBe(false);
  });
});
