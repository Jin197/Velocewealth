'use server';

import { peekRateLimitCount } from '@/lib/rate-limit';
import { isCaptchaConfigured } from '@/lib/security/hcaptcha';
import { getClientIp, hashEmail } from '@/lib/security/request-context';

/**
 * Threshold above which the login form should display the hCaptcha widget.
 * 3 means: after the 3rd consecutive failure (within the 15-min rate window)
 * the client must produce a valid captcha token to attempt another login.
 */
export const CAPTCHA_FAILURE_THRESHOLD = 3;

/**
 * Returns whether the client should display the hCaptcha widget on the
 * current login form. Looks at the same buckets as the rate-limiter so the
 * captcha appears precisely when the attacker is starting to push the limit.
 *
 * - Feature disabled (no keys set) → always returns false (no captcha)
 * - Failure count below threshold → false
 * - Failure count >= threshold (either by email OR by IP) → true
 */
export async function captchaStatusAction(
  email: string,
): Promise<{ required: boolean; siteKey?: string }> {
  if (!isCaptchaConfigured()) return { required: false };

  const ip = getClientIp();
  const emailHash = email ? hashEmail(email) : null;

  const [emailFails, ipFails] = await Promise.all([
    emailHash
      ? peekRateLimitCount(`login:email:${emailHash}`)
      : Promise.resolve(0),
    peekRateLimitCount(`login:ip:${ip}`),
  ]);

  const required =
    emailFails >= CAPTCHA_FAILURE_THRESHOLD ||
    ipFails >= CAPTCHA_FAILURE_THRESHOLD;

  return {
    required,
    siteKey: required
      ? process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
      : undefined,
  };
}
