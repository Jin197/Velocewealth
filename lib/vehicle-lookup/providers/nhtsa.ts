// lib/vehicle-lookup/providers/nhtsa.ts
// Fournisseur gratuit NHTSA vPIC API (gouvernement américain).
// Fonctionne pour tout VIN mondial (17 caractères).
// Aucune clé API requise.

import type { LookupResult } from '../cache';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin';

/**
 * Décode un VIN via l'API NHTSA vPIC (gratuit, aucune clé requise).
 */
export async function lookupByNhtsa(vin: string, plate?: string): Promise<LookupResult | null> {
  try {
    const res = await fetch(
      `${NHTSA_BASE}/${encodeURIComponent(vin)}?format=json`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const results: { Variable: string; Value: string | null }[] = data.Results || [];

    const get = (varName: string): string =>
      results.find((r) => r.Variable === varName)?.Value?.trim() || '';

    const make = get('Make');
    if (!make) return null; // VIN invalide ou non reconnu

    const model = get('Model');
    const yearRaw = get('Model Year');
    const fuelPrimary = get('Fuel Type - Primary');
    const displacement = get('Displacement (L)');
    const cylinders = get('Engine Number of Cylinders');
    const driveType = get('Drive Type');
    const bodyClass = get('Body Class');
    const trim = get('Trim');

    // Construction de la description moteur
    const engineParts = [
      displacement ? `${displacement}L` : '',
      cylinders ? `${cylinders}cyl` : '',
      driveType || '',
    ].filter(Boolean);

    return {
      plate: plate || '',
      make: capitalizeWords(make),
      model: capitalizeWords(model),
      year: yearRaw ? parseInt(yearRaw, 10) : null,
      fuel_type: normalizeFuelType(fuelPrimary),
      engine: engineParts.join(' '),
      vin,
      color: '',
      trim: trim || bodyClass || '',
      source: 'nhtsa',
    };
  } catch {
    return null;
  }
}

function capitalizeWords(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeFuelType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('electri') || lower.includes('ev') || lower.includes('battery')) return 'electric';
  if (lower.includes('hybrid') || lower.includes('hybride')) return 'hybrid';
  return 'thermal';
}
