import type { FuelType, MaintenanceEntry } from '@/lib/types';

export type Category = MaintenanceEntry['category'];

export type Severity = 'info' | 'warning' | 'critical';

/**
 * Generic manufacturer + industry-standard service intervals.
 *
 * Values are conservative recommendations from major OEM service books
 * (Renault, Peugeot, VW, Toyota, Tesla, Stellantis) cross-referenced with
 * FFA/FNAA guidance. `null` means "not applicable for this fuel type".
 */
export interface IntervalSpec {
  km: number | null;
  months: number | null;
  /** Rough median labour + parts cost in EUR for a French/Belgian indep. garage. */
  estimatedCostEur: number;
  /** Whether the task is safety-critical (raises severity). */
  safetyCritical: boolean;
  /** Short description displayed to the user. */
  description: string;
}

export const KNOWLEDGE_BASE: Record<Category, Record<FuelType, IntervalSpec>> = {
  oil: {
    thermal: {
      km: 15_000,
      months: 12,
      estimatedCostEur: 110,
      safetyCritical: false,
      description: 'Vidange huile moteur + filtre à huile',
    },
    hybrid: {
      km: 15_000,
      months: 12,
      estimatedCostEur: 120,
      safetyCritical: false,
      description: 'Vidange moteur thermique (mode hybride)',
    },
    electric: {
      km: null,
      months: null,
      estimatedCostEur: 0,
      safetyCritical: false,
      description: 'N/A — moteur électrique',
    },
  },
  filter: {
    thermal: {
      km: 30_000,
      months: 24,
      estimatedCostEur: 80,
      safetyCritical: false,
      description: 'Filtre à air + filtre habitacle (pollen)',
    },
    hybrid: {
      km: 30_000,
      months: 24,
      estimatedCostEur: 85,
      safetyCritical: false,
      description: 'Filtre à air + filtre habitacle',
    },
    electric: {
      km: 30_000,
      months: 24,
      estimatedCostEur: 60,
      safetyCritical: false,
      description: 'Filtre habitacle (pollen)',
    },
  },
  brakes: {
    thermal: {
      km: 50_000,
      months: 48,
      estimatedCostEur: 280,
      safetyCritical: true,
      description: 'Plaquettes avant + contrôle disques',
    },
    hybrid: {
      km: 70_000,
      months: 60,
      estimatedCostEur: 280,
      safetyCritical: true,
      description: 'Plaquettes (régénératif → usure réduite)',
    },
    electric: {
      km: 80_000,
      months: 60,
      estimatedCostEur: 280,
      safetyCritical: true,
      description: 'Plaquettes (freinage régénératif)',
    },
  },
  tires: {
    thermal: {
      km: 40_000,
      months: 60,
      estimatedCostEur: 480,
      safetyCritical: true,
      description: '4 pneus + équilibrage + parallélisme',
    },
    hybrid: {
      km: 40_000,
      months: 60,
      estimatedCostEur: 520,
      safetyCritical: true,
      description: '4 pneus (renfort charge batterie)',
    },
    electric: {
      km: 35_000,
      months: 60,
      estimatedCostEur: 600,
      safetyCritical: true,
      description: '4 pneus EV (couple instantané → usure +15%)',
    },
  },
  battery: {
    thermal: {
      km: null,
      months: 60,
      estimatedCostEur: 180,
      safetyCritical: false,
      description: 'Batterie 12V de démarrage',
    },
    hybrid: {
      km: null,
      months: 60,
      estimatedCostEur: 220,
      safetyCritical: false,
      description: 'Batterie 12V + diagnostic traction',
    },
    electric: {
      km: 30_000,
      months: 24,
      estimatedCostEur: 90,
      safetyCritical: false,
      description: 'Bilan SoH batterie traction (diagnostic OBD)',
    },
  },
  inspection: {
    thermal: {
      km: null,
      months: 24,
      estimatedCostEur: 78,
      safetyCritical: true,
      description: 'Contrôle technique (4 ans puis tous les 2 ans)',
    },
    hybrid: {
      km: null,
      months: 24,
      estimatedCostEur: 88,
      safetyCritical: true,
      description: 'Contrôle technique + diagnostic hybride',
    },
    electric: {
      km: null,
      months: 24,
      estimatedCostEur: 70,
      safetyCritical: true,
      description: 'Contrôle technique EV',
    },
  },
  other: {
    thermal: {
      km: 60_000,
      months: 48,
      estimatedCostEur: 180,
      safetyCritical: false,
      description: 'Liquide de refroidissement + LDR',
    },
    hybrid: {
      km: 60_000,
      months: 48,
      estimatedCostEur: 180,
      safetyCritical: false,
      description: 'Refroidissement + circuit batterie',
    },
    electric: {
      km: 60_000,
      months: 48,
      estimatedCostEur: 180,
      safetyCritical: false,
      description: 'Refroidissement batterie + onduleur',
    },
  },
};

/**
 * First inspection (contrôle technique) is at 4 years in FR/BE,
 * then every 2 years. This helper returns months-to-first-inspection
 * based on vehicle age.
 */
export function firstInspectionMonths(vehicleAgeMonths: number): number {
  if (vehicleAgeMonths < 48) return 48 - vehicleAgeMonths;
  // After 4 years: cycle every 24 months
  const monthsSinceFirst = vehicleAgeMonths - 48;
  return 24 - (monthsSinceFirst % 24);
}
