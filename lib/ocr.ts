import 'server-only';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { env } from '@/lib/env';

let _client: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (!_client) {
    const credentialsJson = env.googleVisionCredentials();
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      throw new Error(
        'GOOGLE_APPLICATION_CREDENTIALS_JSON must be a valid JSON string',
      );
    }
    _client = new ImageAnnotatorClient({ credentials });
  }
  return _client;
}

export interface OcrParseResult {
  energyType: 'gasoline' | 'diesel' | 'electric' | 'e85' | 'gpl';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stationName: string;
  stationCity: string;
  confidence: number;
  raw: string;
}

/**
 * Parse a fuel receipt: extract station name, fuel type, quantity, prices.
 * Heuristic-based — Phase 4 can swap to a fine-tuned model or LLM.
 */
export async function parseFuelReceipt(
  buffer: Buffer,
): Promise<OcrParseResult> {
  const client = getVisionClient();
  const [result] = await client.textDetection({
    image: { content: buffer },
  });
  const fullText = result.fullTextAnnotation?.text ?? '';
  const confidence = Math.round(
    (result.fullTextAnnotation?.pages?.[0]?.confidence ?? 0.85) * 100,
  );

  const energyType = detectEnergyType(fullText);
  const { quantity, unitPrice, totalPrice } = extractAmounts(fullText);
  const { stationName, stationCity } = detectStation(fullText);

  return {
    energyType,
    quantity,
    unitPrice,
    totalPrice,
    stationName,
    stationCity,
    confidence,
    raw: fullText,
  };
}

function detectEnergyType(text: string): OcrParseResult['energyType'] {
  const t = text.toLowerCase();
  if (/\bsp\s*98|\bsp\s*95|\be10\b|\bessence\b/.test(t)) return 'gasoline';
  if (/\bgazole\b|\bdiesel\b|\bgo\b\s/.test(t)) return 'diesel';
  if (/\be85\b|\bsuper.?éthanol\b/.test(t)) return 'e85';
  if (/\bgpl\b/.test(t)) return 'gpl';
  if (/\bkwh\b|\bcharge\b|\brecharge\b/.test(t)) return 'electric';
  return 'gasoline';
}

function extractAmounts(text: string) {
  // Look for €X.XX patterns and L XX.X patterns
  const numbers = Array.from(
    text.matchAll(/(\d{1,4}[.,]\d{1,3})/g),
  ).map((m) => parseFloat(m[1].replace(',', '.')));
  // Heuristic: largest = total, smallest = unit price, middle = quantity
  const sorted = [...numbers].sort((a, b) => a - b);
  const totalPrice = sorted[sorted.length - 1] ?? 0;
  const unitPrice = sorted.find((n) => n > 0.5 && n < 5) ?? 0;
  const quantity = totalPrice && unitPrice ? +(totalPrice / unitPrice).toFixed(2) : 0;
  return { quantity, unitPrice, totalPrice };
}

function detectStation(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const known = [
    'TotalEnergies',
    'Total',
    'Shell',
    'Esso',
    'BP',
    'Carrefour',
    'Leclerc',
    'Auchan',
    'Intermarché',
    'IONITY',
    'Tesla',
    'Allego',
    'Engie',
  ];
  let stationName = lines[0] ?? '';
  for (const k of known) {
    if (text.toLowerCase().includes(k.toLowerCase())) {
      stationName = k;
      break;
    }
  }
  // Try to find a city: ZIP code line
  const cityMatch = text.match(/\b\d{4,5}\s+([A-ZÀ-Ÿ][\w\s-]{2,30})/);
  const stationCity = cityMatch?.[1]?.trim() ?? '';
  return { stationName, stationCity };
}
