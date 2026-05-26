import type { Category } from './knowledge-base';

/**
 * Curated step-by-step instructions, tooling, difficulty and estimated
 * duration for each maintenance category. Used to enrich a generated
 * MaintenanceTask before it is persisted, so the user has actionable
 * guidance instead of just "Do an oil change next Tuesday".
 */
export interface MaintenanceInstructions {
  /** Short checklist shown inside the task card and the reminder email. */
  checklist: string[];
  /** Hand tools / consumables the user (or their garage) needs. */
  tools: string[];
  /** Subjective DIY difficulty on a 1–5 scale. 1 = anyone, 5 = pro only. */
  diyDifficulty: 1 | 2 | 3 | 4 | 5;
  /** Estimated wall-clock duration for the intervention, in minutes. */
  durationMinutes: number;
  /** Public tutorial worth referencing in the UI. */
  tutorialUrl?: string;
}

export const INSTRUCTIONS: Record<Category, MaintenanceInstructions> = {
  oil: {
    checklist: [
      'Faire chauffer le moteur 3-5 minutes pour fluidifier l\'huile',
      'Lever le véhicule sur cric ou pont avec chandelles de sécurité',
      'Dévisser le bouchon de vidange et laisser couler l\'huile usagée 10 min',
      'Remplacer le joint en cuivre et serrer au couple constructeur',
      'Changer le filtre à huile (vérifier le joint torique)',
      'Remplir avec la viscosité spécifiée et le volume exact',
      'Vérifier la jauge à froid puis après 5 min de chauffe',
      'Recycler l\'huile usagée en déchèterie (obligatoire)',
    ],
    tools: ['Clé bouchon vidange', 'Clé filtre', 'Bac récupérateur', 'Joint cuivre neuf', 'Filtre huile', 'Huile moteur (volume constructeur)', 'Entonnoir'],
    diyDifficulty: 2,
    durationMinutes: 45,
    tutorialUrl: 'https://www.vroomly.com/conseils/comment-faire-vidange-voiture/',
  },
  filter: {
    checklist: [
      'Identifier les filtres à changer (air, habitacle, carburant selon kilométrage)',
      'Ouvrir le boîtier de filtre à air (souvent à clips)',
      'Vérifier le sens d\'écoulement de l\'air sur le filtre neuf',
      'Aspirer le boîtier avant remontage',
      'Remplacer le filtre habitacle (sous la boîte à gants en général)',
      'Refermer les clips et redémarrer pour vérifier le ralenti',
    ],
    tools: ['Filtre à air', 'Filtre habitacle', 'Aspirateur', 'Tournevis cruciforme'],
    diyDifficulty: 1,
    durationMinutes: 20,
    tutorialUrl: 'https://www.vroomly.com/conseils/comment-changer-filtre-a-air/',
  },
  brakes: {
    checklist: [
      'Lever le véhicule et déposer les roues',
      'Inspecter visuellement l\'épaisseur des plaquettes et l\'état des disques',
      'Repousser le piston avec un repousse-piston (sans forcer)',
      'Remplacer plaquettes par paire (essieu complet)',
      'Vérifier le niveau de liquide de frein et purger si nécessaire',
      'Roder progressivement les premiers 200 km : freinages doux',
    ],
    tools: ['Cric + chandelles', 'Clé à choc ou clé en croix', 'Repousse-piston', 'Plaquettes neuves', 'Disques neufs si épaisseur < mini constructeur', 'Liquide de frein DOT 4'],
    diyDifficulty: 3,
    durationMinutes: 90,
    tutorialUrl: 'https://www.vroomly.com/conseils/comment-changer-plaquettes-de-frein/',
  },
  tires: {
    checklist: [
      'Vérifier l\'usure et l\'état des 4 pneus (témoin TWI)',
      'Choisir des pneus de même indice de charge et vitesse',
      'Faire monter, équilibrer et géométrie chez un professionnel',
      'Permuter avant/arrière à chaque entretien pour usure homogène',
      'Vérifier la pression à froid une fois par mois',
    ],
    tools: ['Manomètre', 'Clé dynamométrique', 'Cric (pour permutation maison)'],
    diyDifficulty: 4,
    durationMinutes: 60,
    tutorialUrl: 'https://www.vroomly.com/conseils/quand-changer-pneus-voiture/',
  },
  battery: {
    checklist: [
      'Couper le contact, attendre 10 min',
      'Débrancher la cosse négative (-) en premier',
      'Débrancher la cosse positive (+)',
      'Vérifier l\'ampérage CCA et la capacité de la batterie neuve',
      'Brancher d\'abord le + puis le -',
      'Réinitialiser horloge, autoradio et fenêtres impulsionnelles',
    ],
    tools: ['Clé plate 10mm', 'Batterie neuve (calibre constructeur)', 'Brosse métallique pour cosses', 'Graisse de cosse'],
    diyDifficulty: 2,
    durationMinutes: 30,
    tutorialUrl: 'https://www.vroomly.com/conseils/comment-changer-batterie-voiture/',
  },
  inspection: {
    checklist: [
      'Prendre rendez-vous dans un centre agréé UTAC OTC',
      'Vérifier état des plaques, ampoules, essuie-glaces, ceintures',
      'Contrôler la pression et l\'usure des pneus',
      'Apporter la carte grise originale (obligatoire)',
      'Prévoir 45-60 min sur place',
      'En cas de contre-visite : 2 mois pour corriger',
    ],
    tools: ['Carte grise', 'Carnet d\'entretien (recommandé)'],
    diyDifficulty: 1,
    durationMinutes: 60,
    tutorialUrl: 'https://www.service-public.fr/particuliers/vosdroits/F19846',
  },
  other: {
    checklist: [
      'Vérifier le niveau et la couleur du liquide de refroidissement',
      'Inspecter les durites pour fuites ou gonflements',
      'Vidanger et remplacer si le liquide est trouble ou rouille',
      'Purger le circuit pour évacuer l\'air',
      'Faire tourner le moteur à pleine température pour vérifier',
    ],
    tools: ['Liquide de refroidissement (type constructeur)', 'Entonnoir purgeur', 'Bac récupérateur'],
    diyDifficulty: 3,
    durationMinutes: 60,
    tutorialUrl: 'https://www.vroomly.com/conseils/comment-changer-liquide-refroidissement/',
  },
};

/** Convenience accessor — returns the instructions struct for one category. */
export function getInstructions(category: Category): MaintenanceInstructions {
  return INSTRUCTIONS[category];
}
