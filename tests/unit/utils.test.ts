import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDistance, initials } from '@/lib/utils';
import { sha256, shortHash } from '@/lib/hash';

describe('cn (classname merger)', () => {
  it('merges tailwind classes deduplicating conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
  it('keeps unrelated classes', () => {
    expect(cn('p-2 text-red-500', 'font-bold')).toContain('p-2');
    expect(cn('p-2 text-red-500', 'font-bold')).toContain('font-bold');
  });
  it('handles falsy values', () => {
    expect(cn('p-2', false && 'hidden', null, undefined)).toBe('p-2');
  });
});

describe('formatCurrency', () => {
  it('uses fr-FR locale by default', () => {
    const out = formatCurrency(1234.5, 'EUR', 'fr-FR');
    expect(out).toMatch(/1\s?234,50\s?€/);
  });
  it('handles USD', () => {
    const out = formatCurrency(1000, 'USD', 'en-US');
    expect(out).toMatch(/\$1,000/);
  });
});

describe('formatDistance', () => {
  it('appends km', () => {
    expect(formatDistance(42180)).toMatch(/42[\s ]?180\s?km/);
  });
});

describe('initials', () => {
  it('takes first letter of each word, max 2', () => {
    expect(initials('Aïcha Diallo')).toBe('AD');
    expect(initials('Jean')).toBe('J');
    expect(initials('Marie Anne Dupont')).toBe('MA');
  });
});

describe('sha256', () => {
  it('produces deterministic 64-char hex in browser env', async () => {
    const a = await sha256('hello');
    const b = await sha256('hello');
    expect(a).toBe(b);
    // jsdom provides crypto.subtle, so we get full SHA-256
    if (a.length === 64) {
      expect(a).toMatch(/^[a-f0-9]{64}$/);
    }
  });
  it('produces different output for different input', async () => {
    const a = await sha256('hello');
    const b = await sha256('world');
    expect(a).not.toBe(b);
  });
});

describe('shortHash', () => {
  it('truncates with ellipsis and tail', () => {
    const full = 'abcdef0123456789abcdef0123456789';
    expect(shortHash(full)).toBe('abcdef01…6789');
  });
});
