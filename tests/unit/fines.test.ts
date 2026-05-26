import { describe, it, expect } from 'vitest';
import type { TrafficFine } from '@/lib/types';
import {
  MINORED_FACTOR,
  MAJORED_FACTOR,
  LATE_MAJORED_FACTOR,
  DEFAULT_LICENCE_POINTS,
  daysSinceNotification,
  currentAmountDue,
  daysUntilNextThreshold,
  resolvePaidStatus,
  pointsBalance,
  totalFineCost,
  outstandingFines,
  urgentFines,
  fineImpactRatio,
  calculateFineMetrics,
} from '@/lib/computations/fines';

// Helper to forge a fine quickly.
function fine(overrides: Partial<TrafficFine>): TrafficFine {
  return {
    id: 'f1',
    userId: 'u1',
    vehicleId: 'v1',
    noticeNumber: null,
    documentKey: null,
    category: 'speeding',
    infractionDate: '2026-01-01T08:00:00Z',
    notificationDate: '2026-01-05T08:00:00Z',
    status: 'unpaid',
    pointsDeducted: 1,
    amountInitial: 90,
    amountPaid: null,
    paidAt: null,
    source: 'manual',
    rawOcrText: null,
    notes: null,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-05T08:00:00Z',
    ...overrides,
  };
}

const day = (n: number) => n * 86_400_000;
const NOTIF = Date.parse('2026-01-05T08:00:00Z');
const fixedNow = (offsetDays: number) => () => NOTIF + day(offsetDays);

describe('daysSinceNotification', () => {
  it('counts whole days since the notification timestamp', () => {
    expect(daysSinceNotification(fine({}), fixedNow(10))).toBe(10);
    expect(daysSinceNotification(fine({}), fixedNow(0))).toBe(0);
  });

  it('returns 0 for an invalid notificationDate string', () => {
    expect(
      daysSinceNotification(fine({ notificationDate: 'not-a-date' })),
    ).toBe(0);
  });
});

describe('currentAmountDue — unpaid escalation', () => {
  const base = fine({ amountInitial: 100, status: 'unpaid' });

  it('applies the minored factor inside the 15-day window', () => {
    expect(currentAmountDue(base, fixedNow(5))).toBeCloseTo(
      100 * MINORED_FACTOR,
      2,
    );
  });

  it('keeps the original amount between day 16 and 45', () => {
    expect(currentAmountDue(base, fixedNow(30))).toBe(100);
  });

  it('applies the majored factor between day 46 and 75', () => {
    expect(currentAmountDue(base, fixedNow(60))).toBeCloseTo(
      100 * MAJORED_FACTOR,
      2,
    );
  });

  it('applies the late-majored factor past day 75', () => {
    expect(currentAmountDue(base, fixedNow(120))).toBeCloseTo(
      100 * LATE_MAJORED_FACTOR,
      2,
    );
  });
});

describe('currentAmountDue — settled & inert statuses', () => {
  it('returns amountPaid for any paid_* status', () => {
    const paid = fine({
      status: 'paid_normal',
      amountInitial: 100,
      amountPaid: 100,
    });
    expect(currentAmountDue(paid, fixedNow(40))).toBe(100);
  });

  it('returns 0 for contested or cancelled fines', () => {
    expect(currentAmountDue(fine({ status: 'contested' }), fixedNow(40))).toBe(0);
    expect(currentAmountDue(fine({ status: 'cancelled' }), fixedNow(40))).toBe(0);
  });
});

describe('daysUntilNextThreshold', () => {
  it('counts down to the minored cutoff', () => {
    expect(daysUntilNextThreshold(fine({}), fixedNow(10))).toBe(5);
  });

  it('counts down to the normal cutoff in the middle window', () => {
    expect(daysUntilNextThreshold(fine({}), fixedNow(30))).toBe(15);
  });

  it('returns null in the worst tier', () => {
    expect(daysUntilNextThreshold(fine({}), fixedNow(120))).toBeNull();
  });

  it('returns null for non-unpaid fines', () => {
    expect(
      daysUntilNextThreshold(fine({ status: 'paid_normal' }), fixedNow(10)),
    ).toBeNull();
  });
});

describe('resolvePaidStatus', () => {
  it('returns paid_minored when paid in the first 15 days', () => {
    const result = resolvePaidStatus(fine({}), NOTIF + day(10));
    expect(result).toBe('paid_minored');
  });

  it('returns paid_majored between day 46 and 75', () => {
    const result = resolvePaidStatus(fine({}), NOTIF + day(60));
    expect(result).toBe('paid_majored');
  });

  it('returns paid_late_majored past day 75', () => {
    const result = resolvePaidStatus(fine({}), NOTIF + day(90));
    expect(result).toBe('paid_late_majored');
  });
});

describe('pointsBalance', () => {
  it('starts at the licence baseline when no fines withdraw points', () => {
    expect(pointsBalance([], DEFAULT_LICENCE_POINTS)).toBe(12);
  });

  it('subtracts points for any paid_* fine', () => {
    const fines = [
      fine({ status: 'paid_normal', pointsDeducted: 3 }),
      fine({ status: 'paid_late_majored', pointsDeducted: 2 }),
    ];
    expect(pointsBalance(fines)).toBe(12 - 3 - 2);
  });

  it('subtracts points for unpaid fines past the contestation window', () => {
    const fines = [fine({ status: 'unpaid', pointsDeducted: 4 })];
    expect(pointsBalance(fines, undefined, fixedNow(60))).toBe(12 - 4);
  });

  it('does not subtract points for unpaid fines still in window', () => {
    const fines = [fine({ status: 'unpaid', pointsDeducted: 4 })];
    expect(pointsBalance(fines, undefined, fixedNow(10))).toBe(12);
  });

  it('ignores contested and cancelled fines entirely', () => {
    const fines = [
      fine({ status: 'contested', pointsDeducted: 6 }),
      fine({ status: 'cancelled', pointsDeducted: 4 }),
    ];
    expect(pointsBalance(fines, undefined, fixedNow(120))).toBe(12);
  });

  it('never returns a negative balance', () => {
    const fines = [
      fine({ status: 'paid_normal', pointsDeducted: 6 }),
      fine({ status: 'paid_majored', pointsDeducted: 6 }),
      fine({ status: 'paid_late_majored', pointsDeducted: 3 }),
    ];
    expect(pointsBalance(fines)).toBe(0);
  });
});

describe('totalFineCost & outstandingFines', () => {
  it('sums unpaid current amounts and paid amounts together', () => {
    const fines = [
      fine({ status: 'paid_normal', amountInitial: 90, amountPaid: 90 }),
      fine({ status: 'unpaid', amountInitial: 100 }),
    ];
    expect(totalFineCost(fines, fixedNow(10))).toBe(
      Math.round(90 * 100 + 100 * MINORED_FACTOR * 100) / 100,
    );
  });

  it('outstandingFines reports unpaid count + total only', () => {
    const fines = [
      fine({ status: 'paid_normal', amountPaid: 90 }),
      fine({ status: 'unpaid', amountInitial: 100 }),
      fine({ status: 'unpaid', amountInitial: 50 }),
    ];
    const out = outstandingFines(fines, fixedNow(30));
    expect(out.count).toBe(2);
    expect(out.total).toBe(150);
  });
});

describe('urgentFines', () => {
  it('keeps only unpaid fines within 7 days of the next tariff bump', () => {
    const fines = [
      fine({ id: 'a', status: 'unpaid' }), // notif day 0, now day 10 → 5 days left
      fine({
        id: 'b',
        notificationDate: '2026-01-05T08:00:00Z',
        status: 'unpaid',
      }),
    ];
    const urgent = urgentFines(fines, fixedNow(10));
    expect(urgent.map((f) => f.id)).toEqual(['a', 'b']);
    expect(urgent[0].daysLeft).toBeLessThanOrEqual(7);
  });

  it('drops late-majored fines (no further escalation)', () => {
    const fines = [fine({ status: 'unpaid' })];
    expect(urgentFines(fines, fixedNow(120))).toEqual([]);
  });
});

describe('fineImpactRatio', () => {
  it('returns 0 when there is no vehicle spend at all', () => {
    expect(fineImpactRatio([fine({ status: 'unpaid' })], 0)).toBe(0);
  });

  it('returns a percentage capped at 100', () => {
    const fines = [fine({ status: 'paid_normal', amountPaid: 1000 })];
    expect(fineImpactRatio(fines, 500)).toBe(100);
  });

  it('computes a sensible mid-range value', () => {
    const fines = [fine({ status: 'paid_normal', amountPaid: 90 })];
    expect(fineImpactRatio(fines, 900)).toBe(10);
  });
});

describe('calculateFineMetrics aggregate', () => {
  it('returns all KPIs in one pass', () => {
    const fines = [
      fine({ status: 'paid_normal', pointsDeducted: 1, amountPaid: 90 }),
      fine({ status: 'unpaid', pointsDeducted: 3, amountInitial: 150 }),
    ];
    const m = calculateFineMetrics(fines, 1800, undefined, fixedNow(20));
    expect(m.pointsLeft).toBe(11);
    expect(m.outstanding.count).toBe(1);
    expect(m.totalCost).toBeGreaterThan(0);
    expect(m.impactRatioPct).toBeGreaterThan(0);
  });
});
