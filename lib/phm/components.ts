// lib/phm/components.ts
// Résolution de l'historique de maintenance pour le moteur PHM.
// Remplace toutes les valeurs « mock » par des données réelles (BDD)
// ou des valeurs empiriques constructeur (knowledge-base).

import { KNOWLEDGE_BASE, type Category } from '@/lib/maintenance/knowledge-base';
import type { FuelType } from '@/lib/types';

export interface PhmComponent {
  name: string;
  category: Category;
  lastChangedKm: number;
  expectedLifetimeKm: number;
  /** true = ce composant a un historique réel en BDD */
  hasRealHistory: boolean;
}

/**
 * Mapping entre le nom affiché dans le PHM et la catégorie en BDD.
 */
const PHM_COMPONENTS: { name: string; category: Category }[] = [
  { name: 'Filtre à Air',               category: 'filter'  },
  { name: 'Plaquettes de Frein Avant',   category: 'brakes'  },
  { name: 'Huile Moteur',               category: 'oil'     },
  { name: 'Pneumatiques',               category: 'tires'   },
];

/**
 * Construit la liste des composants PHM en combinant :
 * 1. L'historique réel de maintenance (si disponible)
 * 2. Les intervalles OEM de la knowledge-base (fallback constructeur)
 *
 * Contrairement à l'ancien code, on ne « simule » plus un kilométrage
 * de dernière révision fictif. Si l'utilisateur n'a pas d'historique,
 * on considère que la pièce est d'origine (lastChangedKm = 0) et on
 * marque `hasRealHistory = false` pour que l'UI puisse l'afficher.
 */
export function buildPhmComponents(
  currentMileageKm: number,
  fuelType: FuelType,
  maintenanceHistory: { category: string; mileage_km: number }[] | null,
): PhmComponent[] {
  return PHM_COMPONENTS.map(({ name, category }) => {
    // 1. Chercher la dernière intervention réelle en BDD
    const lastEntry = maintenanceHistory
      ?.filter(m => m.category === category)
      .sort((a, b) => b.mileage_km - a.mileage_km)[0];

    const hasRealHistory = !!lastEntry;

    // 2. Si pas d'historique → la pièce est considérée d'origine (km 0)
    // C'est la différence fondamentale : on ne fabrique plus de faux kilométrage.
    const lastChangedKm = hasRealHistory ? lastEntry.mileage_km : 0;

    // 3. Durée de vie attendue = valeur OEM de la knowledge-base
    const spec = KNOWLEDGE_BASE[category]?.[fuelType];
    const expectedLifetimeKm = spec?.km ?? 30_000; // fallback sécuritaire

    return {
      name,
      category,
      lastChangedKm,
      expectedLifetimeKm,
      hasRealHistory,
    };
  });
}
