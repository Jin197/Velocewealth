import type { Vehicle, FuelEntry, MaintenanceEntry } from '@/lib/types';
import {
  KNOWLEDGE_BASE,
  firstInspectionMonths,
  type Category,
  type IntervalSpec,
  type Severity,
} from './knowledge-base';

export type PlanSource = 'generic' | 'digital-twin' | 'hybrid';

export interface MaintenanceTask {
  category: Category;
  title: string;
  description: string;
  /** Next predicted mileage in km. Undefined for time-only items. */
  dueAtKm?: number;
  /** Next predicted ISO date. */
  dueAtDate: string;
  /** Days from today until this task is due (negative = overdue). */
  daysUntilDue: number;
  /** Km from current mileage until due (negative = overdue). */
  kmUntilDue?: number;
  severity: Severity;
  estimatedCost: number;
  /** Where this prediction came from. */
  source: PlanSource;
  /** 0–1: how confident we are in the prediction (more history = higher). */
  confidence: number;
  /** Reason text shown in UI ("Basé sur 4 vidanges historiques", etc.) */
  reasoning: string;
}

export interface MaintenancePlan {
  vehicleId: string;
  generatedAt: string;
  source: PlanSource;
  /** Estimated annual mileage in km/year, computed from fuel history. */
  annualMileageKm: number;
  /** Source confidence — proportion of categories with history (0–1). */
  globalConfidence: number;
  tasks: MaintenanceTask[];
  /** Total estimated 12-month maintenance budget in vehicle currency. */
  budget12mo: number;
}

const CATEGORY_LABELS: Record<Category, string> = {
  oil: 'Vidange moteur',
  filter: 'Filtres',
  brakes: 'Freinage',
  tires: 'Pneumatiques',
  battery: 'Batterie',
  inspection: 'Contrôle technique',
  other: 'Refroidissement',
};

/**
 * Estimate annual mileage from fuel entries over the last 12 months.
 * Falls back to manufacturer average (15,000 km/year) if insufficient data.
 */
function estimateAnnualMileage(
  vehicle: Vehicle,
  fuel: FuelEntry[],
): { km: number; confidence: number } {
  const oneYearAgo = Date.now() - 365 * 86400000;
  const recent = fuel
    .filter((f) => f.vehicleId === vehicle.id)
    .filter((f) => new Date(f.occurredAt).getTime() >= oneYearAgo)
    .map((f) => ({
      km: f.mileageKm,
      t: new Date(f.occurredAt).getTime(),
    }))
    .filter((p) => p.km > 0)
    .sort((a, b) => a.t - b.t);

  if (recent.length < 2) return { km: 15_000, confidence: 0 };

  const first = recent[0];
  const last = recent[recent.length - 1];
  const dKm = last.km - first.km;
  const dDays = (last.t - first.t) / 86400000;
  if (dDays < 30) return { km: 15_000, confidence: 0.2 };

  const annual = Math.round((dKm / dDays) * 365);
  // Confidence scales with data points (max at 12 fills/year ≈ once a month)
  const confidence = Math.min(1, recent.length / 12);
  return { km: Math.max(2_000, annual), confidence };
}

/**
 * For a given category, find the observed interval (km between consecutive
 * services) from the user's actual maintenance history.
 */
function observedInterval(
  vehicleId: string,
  category: Category,
  history: MaintenanceEntry[],
): { km: number | null; sampleSize: number; lastEntry: MaintenanceEntry | null } {
  const matching = history
    .filter((m) => m.vehicleId === vehicleId && m.category === category)
    .sort((a, b) => a.mileageKm - b.mileageKm);

  if (matching.length === 0) {
    return { km: null, sampleSize: 0, lastEntry: null };
  }
  if (matching.length === 1) {
    return { km: null, sampleSize: 1, lastEntry: matching[0] };
  }

  // Mean delta between consecutive services
  const deltas: number[] = [];
  for (let i = 1; i < matching.length; i++) {
    const delta = matching[i].mileageKm - matching[i - 1].mileageKm;
    if (delta > 0) deltas.push(delta);
  }
  if (deltas.length === 0) {
    return { km: null, sampleSize: matching.length, lastEntry: matching[matching.length - 1] };
  }

  const mean = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  return {
    km: Math.round(mean),
    sampleSize: matching.length,
    lastEntry: matching[matching.length - 1],
  };
}

/** Average cost from history for a category, or null if no data. */
function observedCost(
  vehicleId: string,
  category: Category,
  history: MaintenanceEntry[],
): number | null {
  const costs = history
    .filter((m) => m.vehicleId === vehicleId && m.category === category)
    .map((m) => m.cost)
    .filter((c) => c > 0);
  if (costs.length === 0) return null;
  return Math.round(costs.reduce((s, c) => s + c, 0) / costs.length);
}

/**
 * Build one task for a given category. Combines OEM baseline with observed
 * history when present (digital-twin mode). Returns null if not applicable
 * for this fuel type.
 */
function buildTask(
  vehicle: Vehicle,
  category: Category,
  history: MaintenanceEntry[],
  annualMileageKm: number,
  today: Date,
): MaintenanceTask | null {
  const spec: IntervalSpec = KNOWLEDGE_BASE[category][vehicle.fuelType];

  // Skip if the category doesn't apply to this fuel type
  if (spec.km === null && spec.months === null) return null;

  const obs = observedInterval(vehicle.id, category, history);
  const obsCost = observedCost(vehicle.id, category, history);

  // Decide source & effective interval
  let effectiveKm = spec.km;
  let source: PlanSource = 'generic';
  let confidence = 0.5;
  let reasoning = `Recommandation constructeur (${vehicle.fuelType === 'electric' ? 'EV' : vehicle.fuelType === 'hybrid' ? 'hybride' : 'thermique'})`;

  if (obs.km !== null && obs.sampleSize >= 2 && spec.km !== null) {
    // Take the more conservative (shorter) of the two intervals — safety first
    effectiveKm = Math.min(obs.km, spec.km);
    source = 'digital-twin';
    confidence = Math.min(1, 0.5 + obs.sampleSize * 0.1);
    const trend = obs.km < spec.km ? 'plus court' : 'aligné';
    reasoning = `Jumeau numérique — ${obs.sampleSize} interventions historiques, intervalle moyen ${Math.round(
      obs.km / 1000,
    )}k km (${trend} que la reco ${Math.round(spec.km / 1000)}k km)`;
  } else if (obs.sampleSize === 1) {
    source = 'hybrid';
    confidence = 0.65;
    reasoning = `1 intervention historique + reco constructeur (${Math.round(
      (spec.km ?? 0) / 1000,
    )}k km)`;
  }

  // Compute due-at km
  const baseKm = obs.lastEntry?.mileageKm ?? vehicle.currentMileageKm;
  const dueAtKm = effectiveKm !== null ? baseKm + effectiveKm : undefined;

  // Compute due-at date
  let dueAtDate: Date;
  if (category === 'inspection') {
    // Special handling: CT cycles are time-based regardless of mileage
    const purchaseDate = new Date(vehicle.purchaseDate);
    const ageMonths = Math.floor(
      (today.getTime() - purchaseDate.getTime()) / (30 * 86400000),
    );
    // Use last inspection if present, otherwise based on age
    if (obs.lastEntry) {
      dueAtDate = new Date(obs.lastEntry.occurredAt);
      dueAtDate.setMonth(dueAtDate.getMonth() + (spec.months ?? 24));
    } else {
      const monthsToNext = firstInspectionMonths(ageMonths);
      dueAtDate = new Date(today);
      dueAtDate.setMonth(dueAtDate.getMonth() + monthsToNext);
    }
  } else if (dueAtKm !== undefined && annualMileageKm > 0) {
    // Convert km to date using estimated annual mileage
    const kmRemaining = dueAtKm - vehicle.currentMileageKm;
    const daysRemaining = Math.round((kmRemaining / annualMileageKm) * 365);
    dueAtDate = new Date(today);
    dueAtDate.setDate(dueAtDate.getDate() + daysRemaining);
    // If time-based limit is shorter, take that
    if (spec.months !== null) {
      const lastDate = obs.lastEntry
        ? new Date(obs.lastEntry.occurredAt)
        : new Date(vehicle.purchaseDate);
      const timeDue = new Date(lastDate);
      timeDue.setMonth(timeDue.getMonth() + spec.months);
      if (timeDue.getTime() < dueAtDate.getTime()) dueAtDate = timeDue;
    }
  } else if (spec.months !== null) {
    // Time-only: battery, inspection
    const lastDate = obs.lastEntry
      ? new Date(obs.lastEntry.occurredAt)
      : new Date(vehicle.purchaseDate);
    dueAtDate = new Date(lastDate);
    dueAtDate.setMonth(dueAtDate.getMonth() + spec.months);
  } else {
    return null;
  }

  const daysUntilDue = Math.round(
    (dueAtDate.getTime() - today.getTime()) / 86400000,
  );
  const kmUntilDue =
    dueAtKm !== undefined ? dueAtKm - vehicle.currentMileageKm : undefined;

  // Severity
  let severity: Severity = 'info';
  if (daysUntilDue < 0 || (kmUntilDue !== undefined && kmUntilDue < 0)) {
    severity = 'critical';
  } else if (
    daysUntilDue < 30 ||
    (kmUntilDue !== undefined && kmUntilDue < 1_000)
  ) {
    severity = spec.safetyCritical ? 'critical' : 'warning';
  } else if (
    daysUntilDue < 90 ||
    (kmUntilDue !== undefined && kmUntilDue < 3_000)
  ) {
    severity = 'warning';
  }

  const estimatedCost = obsCost ?? spec.estimatedCostEur;

  return {
    category,
    title: CATEGORY_LABELS[category],
    description: spec.description,
    dueAtKm,
    dueAtDate: dueAtDate.toISOString(),
    daysUntilDue,
    kmUntilDue,
    severity,
    estimatedCost,
    source,
    confidence,
    reasoning,
  };
}

/**
 * Generate a maintenance plan for a vehicle.
 *
 * - **No history** → generic OEM-based plan
 * - **With history** → digital-twin plan that learns from the driver's
 *   actual service intervals and costs
 */
export function generateMaintenancePlan(
  vehicle: Vehicle,
  history: MaintenanceEntry[],
  fuel: FuelEntry[],
  today: Date = new Date(),
): MaintenancePlan {
  const annual = estimateAnnualMileage(vehicle, fuel);

  const categories: Category[] = [
    'oil',
    'filter',
    'brakes',
    'tires',
    'battery',
    'inspection',
    'other',
  ];

  const tasks = categories
    .map((c) => buildTask(vehicle, c, history, annual.km, today))
    .filter((t): t is MaintenanceTask => t !== null)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  // Overall source
  const sources = new Set(tasks.map((t) => t.source));
  const source: PlanSource = sources.has('digital-twin')
    ? sources.size === 1
      ? 'digital-twin'
      : 'hybrid'
    : 'generic';

  // Global confidence = average task confidence weighted by data availability
  const globalConfidence =
    tasks.length > 0
      ? tasks.reduce((s, t) => s + t.confidence, 0) / tasks.length
      : 0;

  // 12-month budget: tasks due within the next year
  const oneYearFromNow = today.getTime() + 365 * 86400000;
  const budget12mo = tasks
    .filter((t) => new Date(t.dueAtDate).getTime() <= oneYearFromNow)
    .reduce((s, t) => s + t.estimatedCost, 0);

  return {
    vehicleId: vehicle.id,
    generatedAt: today.toISOString(),
    source,
    annualMileageKm: annual.km,
    globalConfidence,
    tasks,
    budget12mo,
  };
}
