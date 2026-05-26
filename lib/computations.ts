import type {
  Vehicle,
  FuelEntry,
  MaintenanceEntry,
  InsuranceRecord,
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
  insuranceRecords: InsuranceRecord[] = [],
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

  const insurance = computeInsuranceCost(
    vehicle,
    monthsBack,
    insuranceRecords,
    since,
  );

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

/**
 * Insurance cost over the cost-per-km window. Two regimes:
 *  - fixed mode (default): `insurance_monthly` * months actually owned in the
 *    window. Falls back to 0 when the field is empty.
 *  - variable mode: sum of `insurance_records.amount` whose `month` falls
 *    inside the window. Records that belong to other vehicles or outside the
 *    range are ignored.
 */
function computeInsuranceCost(
  vehicle: Vehicle,
  monthsBack: number,
  insuranceRecords: InsuranceRecord[],
  sinceMs: number,
): number {
  if (vehicle.insuranceMode === 'variable') {
    return insuranceRecords
      .filter(
        (r) =>
          r.vehicleId === vehicle.id &&
          new Date(r.month).getTime() >= sinceMs,
      )
      .reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  }
  const purchaseTime = new Date(vehicle.purchaseDate).getTime();
  let actualMonths = monthsBack;
  if (!isNaN(purchaseTime)) {
    const msDiff = Date.now() - purchaseTime;
    const monthsOwned = msDiff > 0 ? msDiff / (30 * 24 * 60 * 60 * 1000) : 0;
    actualMonths = Math.max(1, Math.min(monthsBack, Math.round(monthsOwned)));
  }
  return (vehicle.insuranceMonthly ?? 0) * actualMonths;
}

export function energyMix(fuel: FuelEntry[]) {
  const totals = fuel.reduce(
    (acc, f) => {
      if (f.energyType === 'electric') {
        acc.electricAmount += f.totalPrice;
        acc.electricVolume += f.quantity || 0;
      } else {
        acc.thermalAmount += f.totalPrice;
        acc.thermalVolume += f.quantity || 0;
      }
      return acc;
    },
    { thermalAmount: 0, electricAmount: 0, thermalVolume: 0, electricVolume: 0 },
  );
  const sumAmount = totals.thermalAmount + totals.electricAmount;
  return {
    thermal: sumAmount > 0 ? totals.thermalAmount / sumAmount : 0,
    electric: sumAmount > 0 ? totals.electricAmount / sumAmount : 0,
    thermalAmount: totals.thermalAmount,
    electricAmount: totals.electricAmount,
    thermalVolume: totals.thermalVolume,
    electricVolume: totals.electricVolume,
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
  vehicles?: Vehicle[],
) {
  const months: { label: string; total: number; energy: number; maint: number; insurance: number }[] = [];
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
      
    let insurance = 0;
    if (vehicles) {
      for (const v of vehicles) {
        const purchaseTime = new Date(v.purchaseDate).getTime();
        if (isNaN(purchaseTime) || purchaseTime < next.getTime()) {
          insurance += v.insuranceMonthly ?? 0;
        }
      }
    }
    
    months.push({
      label,
      total: energy + maint + insurance,
      energy,
      maint,
      insurance,
    });
  }
  return months;
}
