// lib/phm/engine.ts
// Moteur d'Intelligence de Maintenance Prédictive (Prognostics and Health Management)

export interface TelemetryData {
  rpm: number;
  engineLoad: number;
  speed: number;
  maf: number;
  iat: number;
  coolantTemp: number;
  batteryVoltage: number;
}

export interface PrognosticComponent {
  name: string;
  status: 'Excellent' | 'Usure modérée' | 'Remplacement imminent';
  confidence: number;
  rulKm: number;
  anomalyFlag: boolean;
  anomalyReason?: string;
}

/**
 * 1. PHASE INTRODUCTIVE : Détection d'Anomalie (Z-Score & Limites Fixes)
 * Simule le One-Class SVM / Autoencodeur en vérifiant si les paramètres 
 * dévient des seuils de normalité (calcul d'écart).
 */
export function detectAnomaly(telemetry: TelemetryData): { flag: boolean; reason?: string } {
  const anomalies: string[] = [];

  // Ex: Surchauffe moteur
  if (telemetry.coolantTemp > 105) anomalies.push('Température liquide de refroidissement critique');
  
  // Ex: Batterie faible (moteur tournant)
  if (telemetry.rpm > 500 && telemetry.batteryVoltage < 13.0) anomalies.push('Tension alternateur/batterie anormale');
  
  // Ex: Problème d'admission d'air (MAF anormal par rapport au RPM)
  // Approximation : MAF (g/s) devrait être proportionnel au RPM et Engine Load
  if (telemetry.rpm > 2000 && telemetry.engineLoad > 50 && telemetry.maf < 10) {
    anomalies.push('Débit d\'air massique (MAF) anormalement bas (Filtre obstrué ou fuite)');
  }

  return {
    flag: anomalies.length > 0,
    reason: anomalies.length > 0 ? anomalies.join(', ') : undefined
  };
}

/**
 * 2. ANALYSE DE SURVIE : Distribution de Weibull (RUL)
 * Calcule la Durée de Vie Utile Restante (Remaining Useful Life) en fonction 
 * du kilométrage actuel de la pièce et de son espérance de vie (Weibull shape).
 */
export function calculateWeibullRUL(currentKm: number, expectedLifetimeKm: number): number {
  // Simplification du Cox Proportional Hazards pour l'implémentation TypeScript
  // RUL = Expected - Current
  // Si Current > Expected, on est en zone de risque de panne imminente (RUL = 0)
  const baseRul = expectedLifetimeKm - currentKm;
  
  // Ajout d'une variance simulant la courbe de survie
  const survivalProbability = Math.exp(-Math.pow(currentKm / expectedLifetimeKm, 2)); // Shape parameter beta=2 (usure croissante)
  
  const estimatedRul = baseRul > 0 ? Math.round(baseRul * survivalProbability) : 0;
  return Math.max(0, estimatedRul);
}

/**
 * 3. CLASSIFICATION D'ÉTAT : Simule un Random Forest
 * Détermine la classe (0, 1, 2) et le taux de confiance basé sur le RUL et les anomalies.
 */
export function classifyComponentState(rulKm: number, expectedLifetimeKm: number, hasAnomaly: boolean): { status: PrognosticComponent['status']; confidence: number } {
  const lifePercentageRemaining = rulKm / expectedLifetimeKm;
  
  let status: PrognosticComponent['status'] = 'Excellent';
  let confidenceBase = 0.95; // 95% confiant par défaut
  
  if (hasAnomaly) {
    status = 'Remplacement imminent';
    confidenceBase = 0.89; // L'anomalie réduit légèrement la confiance si elle contredit le RUL
  } else if (lifePercentageRemaining < 0.15) {
    status = 'Remplacement imminent';
    confidenceBase = 0.94;
  } else if (lifePercentageRemaining < 0.60) {
    status = 'Usure modérée';
    confidenceBase = 0.91;
  }

  // Ajout d'un léger bruit aléatoire pour simuler la sortie de probabilité d'un modèle ML
  const noise = (Math.random() * 4 - 2) / 100; // +/- 2%
  const confidence = Math.min(99.9, Math.max(0.0, (confidenceBase + noise) * 100));

  return {
    status,
    confidence: Number(confidence.toFixed(1))
  };
}

/**
 * MOTEUR GLOBAL : Évalue le véhicule entier
 */
export function evaluateVehicleHealth(
  currentMileage: number, 
  telemetry: TelemetryData | null, 
  componentsData: { name: string; lastChangedKm: number; expectedLifetimeKm: number }[]
): { overallScore: number; components: PrognosticComponent[] } {
  
  const evaluatedComponents: PrognosticComponent[] = [];
  const anomalyCheck = telemetry ? detectAnomaly(telemetry) : { flag: false };
  let totalHealthPoints = 0;

  for (const comp of componentsData) {
    const kmDrivenOnPart = currentMileage - comp.lastChangedKm;
    const rulKm = calculateWeibullRUL(kmDrivenOnPart, comp.expectedLifetimeKm);
    
    // Pour simplifier, si c'est le Filtre à air, on relie l'anomalie MAF
    const isEngineAnomaly = !!(anomalyCheck.flag && anomalyCheck.reason?.includes('Filtre'));
    const compAnomaly = comp.name.includes('Filtre') ? isEngineAnomaly : false;

    const classification = classifyComponentState(rulKm, comp.expectedLifetimeKm, compAnomaly);

    evaluatedComponents.push({
      name: comp.name,
      status: classification.status,
      confidence: classification.confidence,
      rulKm,
      anomalyFlag: compAnomaly,
      anomalyReason: compAnomaly ? anomalyCheck.reason : undefined
    });

    if (classification.status === 'Excellent') totalHealthPoints += 100;
    else if (classification.status === 'Usure modérée') totalHealthPoints += 70;
    else totalHealthPoints += 30;
  }

  const overallScore = componentsData.length > 0 
    ? Math.round(totalHealthPoints / componentsData.length)
    : 100;

  return {
    overallScore,
    components: evaluatedComponents
  };
}
