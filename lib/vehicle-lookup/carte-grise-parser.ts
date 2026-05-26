import 'server-only';
import type { LookupResult } from './cache';

/**
 * Multi-region driver's-registration-document parser. Takes the raw OCR
 * text returned by Google Vision and extracts vehicle technical fields.
 *
 * Coverage:
 *  - EU harmonised certificate (1999/37/CE codes A→Y): FR, DE, ES, IT, PT,
 *    BE, NL, LU, AT, IE, FI, SE, DK, EE, LT, LV, PL, CZ, SK, HU, RO, BG,
 *    HR, SI, CY, MT, GR
 *  - UK V5C (post-Brexit) — heuristic on labelled lines
 *  - Maghreb (MA / DZ / TN) — French-derived layout
 *
 * The function fails open: missing fields become `null` rather than
 * throwing, so the user can correct them in the form.
 */
export type Region = 'eu' | 'uk' | 'maghreb' | 'unknown';

export interface CarteGriseExtract {
  region: Region;
  plate: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  fuelType: 'thermal' | 'electric' | 'hybrid' | null;
  firstRegistrationDate: string | null;
  trim: string | null;
  /** Confidence 0-100 derived from how many key fields were extracted. */
  confidence: number;
  /** The raw OCR text for downstream debug / future re-parsing. */
  raw: string;
}

export function parseCarteGriseOcr(text: string): CarteGriseExtract {
  if (!text || text.length < 20) {
    return emptyExtract(text, 'unknown');
  }

  const region = detectRegion(text);
  switch (region) {
    case 'eu':
      return parseEuropeanHarmonised(text);
    case 'uk':
      return parseUkV5c(text);
    case 'maghreb':
      return parseMaghreb(text);
    default:
      return emptyExtract(text, 'unknown');
  }
}

// ─── Region detection ────────────────────────────────────────────────

function detectRegion(text: string): Region {
  const t = text.toUpperCase();

  // UK V5C has very distinctive markers
  if (/\bV5C\b|DVLA|VEHICLE REGISTRATION CERTIFICATE/.test(t)) {
    return 'uk';
  }

  // Maghreb cartes grises: country mentioned + French codes mixed with Arabic
  if (
    /\bROYAUME DU MAROC\b|\bREPUBLIQUE ALGERIENNE\b|\bREPUBLIQUE TUNISIENNE\b/.test(
      t,
    )
  ) {
    return 'maghreb';
  }

  // EU harmonised certificate: presence of the canonical A/B/D.1/D.2/E codes
  // (the directive 1999/37/CE codes are stamped on every member-state's
  // registration document).
  const euMarkers = [
    /\bD\.1\b/,
    /\bD\.2\b/,
    /\bE\b\s*[\s:]/,
    /\bF\.1\b/,
    /CERTIFICAT D['’]?IMMATRICULATION/,
    /ZULASSUNGSBESCHEINIGUNG/,
    /PERMISO DE CIRCULACION/,
    /CARTA DI CIRCOLAZIONE/,
    /CERTIFICADO DE MATRICULA/,
  ];
  if (euMarkers.some((rx) => rx.test(t))) {
    return 'eu';
  }

  // Fallback: if we see something that looks like an EU plate format
  if (/[A-Z]{2}-?\d{3}-?[A-Z]{2}/.test(t)) return 'eu';

  return 'unknown';
}

// ─── EU harmonised parser ────────────────────────────────────────────

/**
 * Codes (1999/37/CE):
 *   A   = registration / plate
 *   B   = date of first registration
 *   D.1 = make
 *   D.2 = type / model
 *   D.3 = commercial description (trim)
 *   E   = VIN
 *   F.1 = max permissible mass
 *   P.3 = fuel type
 */
function parseEuropeanHarmonised(text: string): CarteGriseExtract {
  const upper = text.toUpperCase();

  const plate = extractByCode(upper, 'A') || matchPlate(upper);
  const vin = extractByCode(upper, 'E') || matchVin(upper);
  const make = extractByCode(upper, 'D\\.1') || extractByCode(upper, 'D1');
  const model = extractByCode(upper, 'D\\.2') || extractByCode(upper, 'D2');
  const trim = extractByCode(upper, 'D\\.3') || extractByCode(upper, 'D3');
  const rawDate = extractByCode(upper, 'B');
  const fuelRaw = extractByCode(upper, 'P\\.3') || extractByCode(upper, 'P3');

  const year = parseYearFromDate(rawDate);

  const extract: CarteGriseExtract = {
    region: 'eu',
    plate: plate ? normalizePlate(plate) : null,
    vin: vin ? normalizeVin(vin) : null,
    make: cleanField(make),
    model: cleanField(model),
    trim: cleanField(trim),
    year,
    fuelType: normalizeFuelType(fuelRaw),
    firstRegistrationDate: normalizeDate(rawDate),
    confidence: 0,
    raw: text,
  };
  extract.confidence = scoreConfidence(extract);
  return extract;
}

// ─── UK V5C parser ───────────────────────────────────────────────────

/**
 * The V5C uses labelled lines rather than numbered codes:
 *   Registration mark      = plate
 *   Date of first registration = year source
 *   VIN / chassis number   = VIN
 *   Make                   = make
 *   Model                  = model
 *   Fuel type              = fuel
 */
function parseUkV5c(text: string): CarteGriseExtract {
  const upper = text.toUpperCase();

  const plate =
    matchAfterLabel(upper, /(?:REGISTRATION\s+MARK|REG(?:ISTRATION)?\s+NO)/) ||
    matchPlate(upper);
  const vin =
    matchAfterLabel(upper, /(?:VIN|CHASSIS(?:\s+NUMBER)?)/) ||
    matchVin(upper);
  const make = matchAfterLabel(upper, /\bMAKE\b/);
  const model = matchAfterLabel(upper, /\bMODEL\b/);
  const fuelRaw = matchAfterLabel(upper, /FUEL(?:\s+TYPE)?/);
  const rawDate = matchAfterLabel(
    upper,
    /DATE\s+OF\s+FIRST\s+REGISTRATION/,
  );

  const extract: CarteGriseExtract = {
    region: 'uk',
    plate: plate ? normalizePlate(plate) : null,
    vin: vin ? normalizeVin(vin) : null,
    make: cleanField(make),
    model: cleanField(model),
    trim: null,
    year: parseYearFromDate(rawDate),
    fuelType: normalizeFuelType(fuelRaw),
    firstRegistrationDate: normalizeDate(rawDate),
    confidence: 0,
    raw: text,
  };
  extract.confidence = scoreConfidence(extract);
  return extract;
}

// ─── Maghreb parser ─────────────────────────────────────────────────

/**
 * Moroccan, Algerian and Tunisian carte grise documents follow the
 * post-colonial French template: labels in French, sometimes with an Arabic
 * translation. They differ from the EU harmonised certificate in that they
 * don't always carry the A/D.1/D.2 code prefixes.
 *
 * Heuristic: look for the labelled French fields, fall back to free-form
 * plate/VIN detection.
 */
function parseMaghreb(text: string): CarteGriseExtract {
  const upper = text.toUpperCase();

  const plate =
    matchAfterLabel(
      upper,
      /(?:IMMATRICULATION|N(?:UM(?:ÉRO|ERO)?)?\.?\s*D['’]?IMMAT|MATRICULE)/,
    ) || matchMaghrebPlate(upper) || matchPlate(upper);

  const vin =
    matchAfterLabel(
      upper,
      /(?:N\.?\s*DE\s*SERIE|NUMERO\s+DE\s+CHASSIS|VIN|CHASSIS)/,
    ) || matchVin(upper);

  const make = matchAfterLabel(upper, /\b(?:MARQUE|MAKE)\b/);
  const model =
    matchAfterLabel(upper, /\b(?:TYPE\s+COMMERCIAL|MODELE|MODEL)\b/);
  const rawDate = matchAfterLabel(
    upper,
    /(?:DATE\s+DE\s+(?:1RE|PREMIERE)\s+MISE|MISE\s+EN\s+CIRCULATION)/,
  );
  const fuelRaw = matchAfterLabel(
    upper,
    /(?:ENERGIE|CARBURANT|TYPE\s+DE\s+CARBURANT)/,
  );

  const extract: CarteGriseExtract = {
    region: 'maghreb',
    plate: plate ? normalizePlate(plate) : null,
    vin: vin ? normalizeVin(vin) : null,
    make: cleanField(make),
    model: cleanField(model),
    trim: null,
    year: parseYearFromDate(rawDate),
    fuelType: normalizeFuelType(fuelRaw),
    firstRegistrationDate: normalizeDate(rawDate),
    confidence: 0,
    raw: text,
  };
  extract.confidence = scoreConfidence(extract);
  return extract;
}

// ─── Generic helpers ────────────────────────────────────────────────

function extractByCode(text: string, code: string): string | null {
  // Match patterns like "D.1) PEUGEOT" or "A : AB-123-CD"
  const rx = new RegExp(
    `\\b${code}\\s*[)\\.:\\-]\\s*([A-Z0-9 \\-./'’]{2,40})`,
    'i',
  );
  const m = text.match(rx);
  return m?.[1]?.trim() || null;
}

function matchAfterLabel(text: string, labelRx: RegExp): string | null {
  // Capture the value that follows the label up to the next newline or 30 chars
  const rx = new RegExp(
    labelRx.source + `\\s*[:\\-]?\\s*([A-Z0-9 \\-./'’]{2,40})`,
    'i',
  );
  const m = text.match(rx);
  return m?.[1]?.split(/\r?\n/)[0]?.trim() || null;
}

function matchPlate(text: string): string | null {
  // EU 2009 format: AA-123-AA, UK: AA12 ABC, ES: 1234 ABC, IT: AA 123 BB
  const candidates = [
    /\b[A-Z]{2}-?\d{3}-?[A-Z]{2}\b/, // FR new
    /\b[A-Z]{2}\d{2}\s?[A-Z]{3}\b/, // UK
    /\b\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}\b/, // FR old
    /\b\d{4}\s?[A-Z]{3}\b/, // ES
  ];
  for (const rx of candidates) {
    const m = text.match(rx);
    if (m) return m[0];
  }
  return null;
}

function matchMaghrebPlate(text: string): string | null {
  // Moroccan: 12345 - أ - 1, often transliterated as "12345 A 1"
  // Algerian: 12345-123-16 (last block = province code)
  // Tunisian: TUN xxxx (label) or 123 TU 4567
  const candidates = [
    /\b\d{4,6}\s*-?\s*[A-Z]{1,3}\s*-?\s*\d{1,3}\b/,
    /\bTUN\s*\d{3,5}\b/,
  ];
  for (const rx of candidates) {
    const m = text.match(rx);
    if (m) return m[0];
  }
  return null;
}

function matchVin(text: string): string | null {
  // VIN: 17 alphanumeric chars, no I/O/Q
  const m = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  return m?.[0] || null;
}

function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s]/g, '');
}

function normalizeVin(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}

function cleanField(raw: string | null): string | null {
  if (!raw) return null;
  // Strip trailing OCR noise; titlecase for make/model readability.
  const cleaned = raw.replace(/[^A-Za-zÀ-ÿ0-9 .\-']/g, ' ').trim();
  if (!cleaned || cleaned.length < 2) return null;
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseYearFromDate(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/(19|20)\d{2}/);
  if (!m) return null;
  const year = parseInt(m[0], 10);
  if (year < 1900 || year > new Date().getFullYear() + 1) return null;
  return year;
}

function normalizeDate(raw: string | null): string | null {
  if (!raw) return null;
  // Accept DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const slash = raw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  return null;
}

function normalizeFuelType(
  raw: string | null,
): 'thermal' | 'electric' | 'hybrid' | null {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (/electr|battery|\bev\b|elektr/.test(t)) return 'electric';
  if (/hybr|phev|hybride/.test(t)) return 'hybrid';
  if (/diesel|gazole|essence|petrol|gasoline|gpl|e85|gnv|lpg|sp95|sp98/.test(t)) {
    return 'thermal';
  }
  return null;
}

function scoreConfidence(extract: CarteGriseExtract): number {
  let score = 0;
  if (extract.plate) score += 30;
  if (extract.vin) score += 25;
  if (extract.make) score += 15;
  if (extract.model) score += 15;
  if (extract.year) score += 10;
  if (extract.fuelType) score += 5;
  return score;
}

function emptyExtract(raw: string, region: Region): CarteGriseExtract {
  return {
    region,
    plate: null,
    vin: null,
    make: null,
    model: null,
    trim: null,
    year: null,
    fuelType: null,
    firstRegistrationDate: null,
    confidence: 0,
    raw,
  };
}

/**
 * Convert a successful extract into the canonical LookupResult shape used
 * by the rest of the vehicle-lookup module.
 */
export function extractToLookupResult(
  extract: CarteGriseExtract,
): LookupResult | null {
  if (!extract.plate && !extract.vin) return null;
  return {
    plate: extract.plate || '',
    make: extract.make || '',
    model: extract.model || '',
    year: extract.year ?? null,
    fuel_type: extract.fuelType || '',
    engine: '',
    vin: extract.vin || '',
    color: '',
    trim: extract.trim || '',
    source: 'carte-grise-ocr',
  };
}
