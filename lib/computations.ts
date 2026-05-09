import type {
  Vehicle,
  FuelEntry,
  MaintenanceEntry,
} from '@/lib/types';

export interface CostBreakdown {
  energy: number;
  maintenance: number;
  insurance: number;
  total: number;
  distance: number;
  costPerKm: number;
  currency: string;
}

/**
 * (Énergie + Entretien + Assurance) / Distance — formule du cahier des charges.
 * Distance déduite de l'écart de kilométrage entre le premier et le dernier
 * relevé carburant sur la période.
 */
export function computeCostPerKm(
  vehicle: Vehicle,
  fuel: FuelEntry[],
  maintenance: MaintenanceEntry[],
  monthsBack: number = 12,
): CostBreakdown {
  const since = Date.now() - monthsBack * 30 * 86400000;

  const fuelInRange = fuel.filter(
    (f) => f.vehicleId === vehicle.id && new Date(f.occurredAt).getTime() >= since,
  );
  const maintInRange = maintenance.filter(
    (m) => m.vehicleId === vehicle.id && new Date(m.occurredAt).getTime() >= since,
  );

  const energy = fuelInRange.reduce((s, f) => s + f.totalPrice, 0);
  const maint = maintInRange.reduce((s, m) => s + m.cost, 0);
  const insurance = (vehicle.insuranceMonthly ?? 0) * monthsBack;

  const mileages = fuelInRange.map((f) => f.mileageKm).filter(Boolean);
  const distance =
    mileages.length >= 2
      ? Math.max(...mileages) - Math.min(...mileages)
      : 0;

  const total = energy + maint + insurance;
  const costPerKm = distance > 0 ? total / distance : 0;

  return {
    energy,
    maintenance: maint,
    insurance,
    total,
    distance,
    costPerKm,
    currency: vehicle.currency,
  };
}

export function energyMix(fuel: FuelEntry[]) {
  const totals = fuel.reduce(
    (acc, f) => {
      if (f.energyType === 'electric') acc.electric += f.totalPrice;
      else acc.thermal += f.totalPrice;
      return acc;
    },
    { thermal: 0, electric: 0 },
  );
  const sum = totals.thermal + totals.electric;
  return {
    thermal: sum > 0 ? totals.thermal / sum : 0,
    electric: sum > 0 ? totals.electric / sum : 0,
    thermalAmount: totals.thermal,
    electricAmount: totals.electric,
  };
}

/** Naive wear estimation: linear from last service to next due. */
export function tireWearPercent(
  currentKm: number,
  lastServiceKm: number,
  nextDueKm: number | undefined,
): number {
  if (!nextDueKm || nextDueKm <= lastServiceKm) return 0;
  const total = nextDueKm - lastServiceKm;
  const elapsed = Math.max(0, currentKm - lastServiceKm);
  return Math.min(100, Math.round((elapsed / total) * 100));
}

export function monthlySpend(
  fuel: FuelEntry[],
  maintenance: MaintenanceEntry[],
  monthsBack: number = 6,
) {
  const months: { label: string; total: number; energy: number; maint: number }[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString('fr-FR', { month: 'short' });
    const energy = fuel
      .filter(
        (f) =>
          new Date(f.occurredAt) >= d && new Date(f.occurredAt) < next,
      )
      .reduce((s, f) => s + f.totalPrice, 0);
    const maint = maintenance
      .filter(
        (m) =>
          new Date(m.occurredAt) >= d && new Date(m.occurredAt) < next,
      )
      .reduce((s, m) => s + m.cost, 0);
    months.push({ label, total: energy + maint, energy, maint });
  }
  return months;
}
