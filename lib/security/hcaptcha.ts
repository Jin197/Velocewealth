import 'server-only';

/**
 * Server-side hCaptcha token verification.
 *
 * Feature flag: only enforced when `HCAPTCHA_SECRET_KEY` is set in the env.
 * Until then `requireCaptcha` returns true (skip) and `verifyCaptchaToken`
 * returns true (accept) — so dev and existing deployments aren't broken
 * by the addition of this check.
 *
 * To enable in production:
 *   1. Create a site at https://www.hcaptcha.com/ → get sitekey + secret
 *   2. Set in Vercel env:
 *        NEXT_PUBLIC_HCAPTCHA_SITE_KEY = <sitekey>
 *        HCAPTCHA_SECRET_KEY           = <secret>
 *   3. Redeploy — the login form will start showing the invisible widget
 *      after the 3rd consecutive failure for a given email or IP.
 */
const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

/** True when hCaptcha is configured AND the client has crossed the failure threshold. */
export function isCaptchaConfigured(): boolean {
  return Boolean(
    process.env.HCAPTCHA_SECRET_KEY &&
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
  );
}

/**
 * Verify a token returned by the hCaptcha widget. Returns true on success
 * (or if the feature is disabled). False means the user should be rejected.
 */
export async function verifyCaptchaToken(
  token: string | null,
): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true; // feature disabled — accept
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    const res = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    // Network failure — fail closed (reject), unlike HIBP. The point of the
    // captcha is to slow down attackers, so a verifier outage shouldn't
    // create an open door.
    return false;
  }
}
