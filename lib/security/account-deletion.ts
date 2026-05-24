import 'server-only';
import crypto from 'crypto';

// Re-export the shareable constants so server-side callers can still pull
// everything from a single module (the client side must import them from
// `./account-deletion-phrases` directly because this file is server-only).
export {
  CONFIRMATION_PHRASES,
  isValidConfirmationPhrase,
  type ConfirmationLocale,
} from './account-deletion-phrases';

/**
 * Account-deletion OTP lifecycle helpers.
 *
 * Design:
 *   - 6-digit numeric code (10^6 entropy). Combined with the 15-min validity
 *     and the rate-limit on requestAccountDeletionAction (1 / 5 min per user),
 *     brute-forcing is economically infeasible.
 *   - SHA-256 hash stored in DB so a row leak can't be replayed.
 *   - Constant-time string compare on verify to prevent timing-side-channel
 *     guessing of the hash.
 */

const OTP_DIGITS = 6;
const OTP_TTL_MINUTES = 15;

/** Generate a numeric OTP, zero-padded to OTP_DIGITS. */
export function generateOtp(): string {
  // crypto.randomInt is uniform and cryptographically secure.
  const max = 10 ** OTP_DIGITS;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(OTP_DIGITS, '0');
}

/** Hash an OTP for at-rest storage. */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Constant-time compare so an attacker can't deduce hash prefixes from
 * timing variance. Both args must be hex strings of the same length;
 * `false` is returned for any structural mismatch.
 */
export function verifyOtp(provided: string, storedHash: string): boolean {
  const providedHash = hashOtp(provided);
  if (providedHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(providedHash, 'hex'),
    Buffer.from(storedHash, 'hex'),
  );
}

/** ISO timestamp `OTP_TTL_MINUTES` minutes from now. */
export function otpExpiresAt(): string {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
}

export const OTP_VALIDITY_MINUTES = OTP_TTL_MINUTES;
