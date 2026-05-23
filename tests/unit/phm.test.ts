import { describe, it, expect } from 'vitest';
import {
  calculateZScore,
  detectAnomaly,
  calculateWeibullRUL,
  getWeibullBeta,
  classifyComponentState,
  evaluateVehicleHealth,
  type TelemetryData,
} from '@/lib/phm/engine';

describe('PHM (Prognostics and Health Management) Engine', () => {
  describe('calculateZScore', () => {
    it('calculates exact Z-score correctly', () => {
      // (95 - 90) / 5 = 1
      expect(calculateZScore(95, 90, 5)).toBe(1);
      // (80 - 90) / 5 = -2
      expect(calculateZScore(80, 90, 5)).toBe(-2);
      // (13.4 - 14.0) / 0.3 = -2
      expect(calculateZScore(13.4, 14.0, 0.3)).toBeCloseTo(-2, 5);
    });
  });

  describe('detectAnomaly (Z-Score & Fixed Thresholds)', () => {
    const normalTelemetry: TelemetryData = {
      rpm: 2000,
      engineLoad: 30,
      speed: 50,
      maf: 15,
      iat: 25,
      coolantTemp: 90,
      batteryVoltage: 14.0,
    };

    it('returns no anomaly for standard telemetry within normal bounds', () => {
      const res = detectAnomaly(normalTelemetry);
      expect(res.flag).toBe(false);
      expect(res.reason).toBeUndefined();
    });

    it('detects engine overheat when coolant Z-score > 3.0', () => {
      const highTemp: TelemetryData = { ...normalTelemetry, coolantTemp: 106 }; // (106 - 90) / 5 = 3.2 > 3.0
      const res = detectAnomaly(highTemp);
      expect(res.flag).toBe(true);
      expect(res.reason).toContain('Surchauffe moteur détectée');
      expect(res.reason).toContain('Z-Score Coolant: +3.2');
    });

    it('detects alternator/battery anomaly when running battery Z-score < -3.0', () => {
      const lowVoltage: TelemetryData = { ...normalTelemetry, rpm: 800, batteryVoltage: 13.0 }; // (13.0 - 14.0) / 0.3 = -3.33 < -3.0
      const res = detectAnomaly(lowVoltage);
      expect(res.flag).toBe(true);
      expect(res.reason).toContain('Tension alternateur/batterie critique');
      expect(res.reason).toContain('Z-Score Tension: -3.3');
    });

    it('ignores battery voltage drops when engine is off (low RPM)', () => {
      const engineOffLowVoltage: TelemetryData = { ...normalTelemetry, rpm: 0, batteryVoltage: 12.0 };
      const res = detectAnomaly(engineOffLowVoltage);
      expect(res.flag).toBe(false); // No alternator check when engine is off
    });

    it('detects MAF air intake anomalies', () => {
      const lowMaf: TelemetryData = { ...normalTelemetry, rpm: 2500, engineLoad: 60, maf: 5 };
      const res = detectAnomaly(lowMaf);
      expect(res.flag).toBe(true);
      expect(res.reason).toContain('MAF');
    });
  });

  describe('Weibull Remaining Useful Life (RUL)', () => {
    it('calibrates RUL estimation based on component usage and eta/expected life', () => {
      // expected = 30k, current = 15k, beta = 2.0 (standard)
      const rul1 = calculateWeibullRUL(15000, 30000, 2.0);
      expect(rul1).toBeLessThan(15000); // due to survival probability < 1.0
      expect(rul1).toBeGreaterThan(0);

      // when current exceeds expected life, RUL should be 0
      const rulExpired = calculateWeibullRUL(35000, 30000, 2.0);
      expect(rulExpired).toBe(0);
    });

    it('returns custom calibrated Weibull shape beta parameters for wear components', () => {
      expect(getWeibullBeta('Huile Moteur')).toBe(2.0);
      expect(getWeibullBeta('Plaquettes de Frein Avant')).toBe(2.2);
      expect(getWeibullBeta('Filtre à Air')).toBe(1.8);
      expect(getWeibullBeta('Pneumatiques')).toBe(2.5);
      expect(getWeibullBeta('Unknown Component')).toBe(2.0);
    });
  });

  describe('classifyComponentState (Random Forest Emulator)', () => {
    it('assigns Excellent state for high remaining RUL', () => {
      const res = classifyComponentState(25000, 30000, false);
      expect(res.status).toBe('Excellent');
      expect(res.confidence).toBeGreaterThanOrEqual(93);
      expect(res.confidence).toBeLessThanOrEqual(97);
    });

    it('assigns Usure modérée state for mid-range RUL', () => {
      const res = classifyComponentState(12000, 30000, false); // 40% left
      expect(res.status).toBe('Usure modérée');
      expect(res.confidence).toBeGreaterThanOrEqual(89);
      expect(res.confidence).toBeLessThanOrEqual(93);
    });

    it('assigns Remplacement imminent for low RUL (< 15%)', () => {
      const res = classifyComponentState(3000, 30000, false); // 10% left
      expect(res.status).toBe('Remplacement imminent');
      expect(res.confidence).toBeGreaterThanOrEqual(92);
      expect(res.confidence).toBeLessThanOrEqual(96);
    });

    it('assigns Remplacement imminent immediately when anomaly flag is active', () => {
      const res = classifyComponentState(25000, 30000, true);
      expect(res.status).toBe('Remplacement imminent');
      expect(res.confidence).toBeGreaterThanOrEqual(87);
      expect(res.confidence).toBeLessThanOrEqual(91);
    });

    it('is completely deterministic', () => {
      const res1 = classifyComponentState(12000, 30000, false);
      const res2 = classifyComponentState(12000, 30000, false);
      expect(res1.confidence).toBe(res2.confidence); // Deterministic! No random fluctuation.
    });
  });

  describe('evaluateVehicleHealth', () => {
    it('aggregates individual components and computes overall score', () => {
      const components = [
        { name: 'Filtre à Air', lastChangedKm: 78000, expectedLifetimeKm: 30000 }, // 2k driven, excellent
        { name: 'Huile Moteur', lastChangedKm: 78000, expectedLifetimeKm: 15000 }, // 2k driven, excellent
      ];
      
      const res = evaluateVehicleHealth(80000, null, components);
      expect(res.overallScore).toBe(100);
      expect(res.components).toHaveLength(2);
      expect(res.components[0].status).toBe('Excellent');
      expect(res.components[1].status).toBe('Excellent');
    });
  });
});
