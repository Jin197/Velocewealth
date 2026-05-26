import type { TrafficFine, FineStatus } from '@/lib/types';

/**
 * French ANTAI tariff schedule as of 2026. Constants in one place so they
 * are easy to revisit if the legislator moves the thresholds.
 *
 * - Minored: ≤ 15 days from notification → 33% off
 * - Normal: 16-45 days
 * - Majored: 46-75 days → +50%
 * - Late majored: > 75 days → +170% (the recovery agent kicks in)
 */
export const MINORED_DEADLINE_DAYS = 15;
export const NORMAL_DEADLINE_DAYS = 45;
export const MAJORED_DEADLINE_DAYS = 75;
export const MINORED_FACTOR = 0.67;
export const NORMAL_FACTOR = 1.0;
export const MAJORED_FACTOR = 1.5;
export const LATE_MAJORED_FACTOR = 2.7;

/** Driver licence baseline used as the canonical starting balance in FR. */
export const DEFAULT_LICENCE_POINTS = 12;

/** Days the contestation window stays open after notification. */
export const CONTESTATION_WINDOW_DAYS = 45;

/** Soft urgency window used to flag unpaid fines about to escalate. */
export const URGENT_THRESHOLD_DAYS = 7;

type TimeSource = () => number;
const realNow: TimeSource = () => Date.now();

/** Number of whole days between `notification_date` and `now`. */
export function daysSinceNotification(
  fine: Pick<TrafficFine, 'notificationDate'>,
  now: TimeSource = realNow,
): number {
  const start = new Date(fine.notificationDate).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.floor((now() - start) / 86_400_000);
}

/**
 * Amount the user owes right now. Fines already settled return their
 * `amountPaid`; contested or cancelled return 0; unpaid is recomputed
 * against the current escalation tier.
 */
export function currentAmountDue(
  fine: Pick<
    TrafficFine,
    'status' | 'amountInitial' | 'amountPaid' | 'notificationDate'
  >,
  now: TimeSource = realNow,
): number {
  switch (fine.status) {
    case 'paid_minored':
    case 'paid_normal':
    case 'paid_majored':
    case 'paid_late_majored':
      return fine.amountPaid ?? 0;
    case 'contested':
    case 'cancelled':
      return 0;
    case 'unpaid':
      break;
  }
  const elapsed = daysSinceNotification(fine, now);
  const factor =
    elapsed <= MINORED_DEADLINE_DAYS
      ? MINORED_FACTOR
      : elapsed <= NORMAL_DEADLINE_DAYS
        ? NORMAL_FACTOR
        : elapsed <= MAJORED_DEADLINE_DAYS
          ? MAJORED_FACTOR
          : LATE_MAJORED_FACTOR;
  return round2(fine.amountInitial * factor);
}

/**
 * How many days until the next price tier kicks in. Returns `null` for
 * fines already in the worst tier (`late_majored`) or non-unpaid statuses.
 */
export function daysUntilNextThreshold(
  fine: Pick<TrafficFine, 'status' | 'notificationDate'>,
  now: TimeSource = realNow,
): number | null {
  if (fine.status !== 'unpaid') return null;
  const elapsed = daysSinceNotification(fine, now);
  if (elapsed <= MINORED_DEADLINE_DAYS) return MINORED_DEADLINE_DAYS - elapsed;
  if (elapsed <= NORMAL_DEADLINE_DAYS) return NORMAL_DEADLINE_DAYS - elapsed;
  if (elapsed <= MAJORED_DEADLINE_DAYS) return MAJORED_DEADLINE_DAYS - elapsed;
  return null;
}

/**
 * Determines which `paid_*` status a settled fine should carry, given the
 * date it was actually paid. Server actions call this when the user clicks
 * "Mark as paid" so the historical record reflects the real escalation.
 */
export function resolvePaidStatus(
  fine: Pick<TrafficFine, 'notificationDate'>,
  paidAt: Date | string | number,
): Extract<
  FineStatus,
  'paid_minored' | 'paid_normal' | 'paid_majored' | 'paid_late_majored'
> {
  const paidMs =
    paidAt instanceof Date
      ? paidAt.getTime()
      : typeof paidAt === 'number'
        ? paidAt
        : new Date(paidAt).getTime();
  const notifMs = new Date(fine.notificationDate).getTime();
  const elapsed = Math.floor((paidMs - notifMs) / 86_400_000);
  if (elapsed <= MINORED_DEADLINE_DAYS) return 'paid_minored';
  if (elapsed <= NORMAL_DEADLINE_DAYS) return 'paid_normal';
  if (elapsed <= MAJORED_DEADLINE_DAYS) return 'paid_majored';
  return 'paid_late_majored';
}

/**
 * Theoretical remaining licence points. Only fines that actually withdrew
 * points (paid_* or unpaid past the contestation window) count.
 * Contested and cancelled fines are ignored — the user is fighting them or
 * they have been dismissed.
 */
export function pointsBalance(
  fines: Pick<TrafficFine, 'status' | 'pointsDeducted' | 'notificationDate'>[],
  initialBalance: number = DEFAULT_LICENCE_POINTS,
  now: TimeSource = realNow,
): number {
  const deducted = fines.reduce((acc, f) => {
    if (
      f.status === 'paid_minored' ||
      f.status === 'paid_normal' ||
      f.status === 'paid_majored' ||
      f.status === 'paid_late_majored'
    ) {
      return acc + (f.pointsDeducted ?? 0);
    }
    if (
      f.status === 'unpaid' &&
      daysSinceNotification(f, now) > CONTESTATION_WINDOW_DAYS
    ) {
      return acc + (f.pointsDeducted ?? 0);
    }
    return acc;
  }, 0);
  return Math.max(0, initialBalance - deducted);
}

/**
 * Hard losses caused by fines: everything already paid + everything
 * outstanding at today's tier. Used as numerator for the impact ratio
 * and for KPI cards.
 */
export function totalFineCost(
  fines: Pick<
    TrafficFine,
    'status' | 'amountInitial' | 'amountPaid' | 'notificationDate'
  >[],
  now: TimeSource = realNow,
): number {
  return round2(fines.reduce((acc, f) => acc + currentAmountDue(f, now), 0));
}

/**
 * Fines outstanding right now (status unpaid). Returns sum + count so the
 * dashboard can show "3 amendes en attente (148 €)".
 */
export function outstandingFines(
  fines: Pick<
    TrafficFine,
    'status' | 'amountInitial' | 'amountPaid' | 'notificationDate'
  >[],
  now: TimeSource = realNow,
): { count: number; total: number } {
  const unpaid = fines.filter((f) => f.status === 'unpaid');
  return {
    count: unpaid.length,
    total: round2(unpaid.reduce((acc, f) => acc + currentAmountDue(f, now), 0)),
  };
}

/**
 * Fines closest to a tariff bump. Sorted by urgency ascending so the
 * dashboard can pluck `[0]` to render "Majoration dans 3j".
 */
export function urgentFines<T extends Pick<TrafficFine, 'status' | 'notificationDate'>>(
  fines: T[],
  now: TimeSource = realNow,
): Array<T & { daysLeft: number }> {
  return fines
    .map((f) => ({ ...f, daysLeft: daysUntilNextThreshold(f, now) }))
    .filter(
      (f): f is T & { daysLeft: number } =>
        f.daysLeft !== null && f.daysLeft <= URGENT_THRESHOLD_DAYS,
    )
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Impact of fines on a vehicle's total operating expenditure, %. */
export function fineImpactRatio(
  fines: Pick<
    TrafficFine,
    'status' | 'amountInitial' | 'amountPaid' | 'notificationDate'
  >[],
  totalVehicleSpend: number,
  now: TimeSource = realNow,
): number {
  if (totalVehicleSpend <= 0) return 0;
  const ratio = (totalFineCost(fines, now) / totalVehicleSpend) * 100;
  return Math.max(0, Math.min(100, round2(ratio)));
}

export interface FineMetrics {
  totalCost: number;
  outstanding: { count: number; total: number };
  pointsLeft: number;
  pointsLost: number;
  impactRatioPct: number;
  urgent: Array<{ id?: string; daysLeft: number }>;
}

/**
 * Convenience aggregator used by both the per-vehicle panel and the
 * dashboard KPI card.
 */
export function calculateFineMetrics(
  fines: TrafficFine[],
  totalVehicleSpend: number,
  initialPoints: number = DEFAULT_LICENCE_POINTS,
  now: TimeSource = realNow,
): FineMetrics {
  const pointsLeft = pointsBalance(fines, initialPoints, now);
  return {
    totalCost: totalFineCost(fines, now),
    outstanding: outstandingFines(fines, now),
    pointsLeft,
    pointsLost: initialPoints - pointsLeft,
    impactRatioPct: fineImpactRatio(fines, totalVehicleSpend, now),
    urgent: urgentFines(fines, now).map((f) => ({
      id: 'id' in f ? (f as TrafficFine).id : undefined,
      daysLeft: f.daysLeft,
    })),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
