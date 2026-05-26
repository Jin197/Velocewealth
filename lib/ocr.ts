import 'server-only';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { env } from '@/lib/env';

let _client: ImageAnnotatorClient | null = null;

export function getVisionClient(): ImageAnnotatorClient {
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
  const isPdf = buffer.toString('utf8', 0, 4) === '%PDF';

  let fullText = '';
  let confidence = 85;

  try {
    if (isPdf) {
      const [response] = await client.batchAnnotateFiles({
        requests: [
          {
            inputConfig: { content: buffer, mimeType: 'application/pdf' },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            pages: [1], // Analyser uniquement la première page pour le ticket/facture
          },
        ],
      });

      const fileResponse = response.responses?.[0];
      if (fileResponse?.error) {
        throw new Error(fileResponse.error.message || 'Erreur lors du traitement du fichier PDF');
      }

      const pages = fileResponse?.responses || [];
      fullText = pages.map((p) => p.fullTextAnnotation?.text || '').join('\n');
      const firstPageConfidence = pages[0]?.fullTextAnnotation?.pages?.[0]?.confidence;
      if (typeof firstPageConfidence === 'number') {
        confidence = Math.round(firstPageConfidence * 100);
      }
    } else {
      const [result] = await client.textDetection({
        image: { content: buffer },
      });
      fullText = result.fullTextAnnotation?.text ?? '';
      const firstPageConfidence = result.fullTextAnnotation?.pages?.[0]?.confidence;
      if (typeof firstPageConfidence === 'number') {
        confidence = Math.round(firstPageConfidence * 100);
      }
    }
  } catch (err: any) {
    // Si l'erreur est liée à la facturation non configurée sur GCP
    if (err.message?.includes('BILLING_DISABLED') || err.details?.includes('billing to be enabled')) {
      throw new Error(
        'L\'API Google Cloud Vision requiert l\'activation de la facturation sur la console GCP (premiers 1000 scans gratuits). Veuillez associer un compte de facturation.'
      );
    }
    throw err;
  }

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
  // Recherche tous les nombres à décimales (ex: 42.50 ou 1,859)
  const numbers = Array.from(
    text.matchAll(/(\d{1,4}[.,]\d{1,3})/g),
  ).map((m) => parseFloat(m[1].replace(',', '.')));

  if (numbers.length === 0) {
    return { quantity: 0, unitPrice: 0, totalPrice: 0 };
  }

  let totalPrice = 0;
  let quantity = 0;
  let unitPrice = 0;

  // 1. Recherche d'un motif explicite pour le Total (ex: Total 68.34 EUR)
  const totalMatch = text.match(/(?:total|payer|montant|net|ttc)[\s:€$]*(\d{1,4}[.,]\d{2})/i);
  if (totalMatch) {
    totalPrice = parseFloat(totalMatch[1].replace(',', '.'));
  }

  // 2. Recherche d'un motif explicite pour la Quantité (ex: 38.20 L ou litres)
  const qtyMatch = text.match(/(\d{1,4}[.,]\d{1,2})\s*(?:l|litres|ltr|vol|kwh)\b/i);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1].replace(',', '.'));
  }

  // 3. Recherche d'un motif explicite pour le Prix Unitaire (ex: 1.789 €/L ou /L)
  const priceMatch = text.match(/(\d\b[.,]\d{3})\s*(?:€|eur|\/|le litre)/i);
  if (priceMatch) {
    unitPrice = parseFloat(priceMatch[1].replace(',', '.'));
  }

  // 4. Fallback sur l'heuristique des tris si des valeurs manquent
  const sorted = Array.from(new Set(numbers)).sort((a, b) => a - b);

  if (!totalPrice && sorted.length > 0) {
    totalPrice = sorted[sorted.length - 1]; // Le plus grand nombre est le prix total
  }

  if (!unitPrice && sorted.length > 0) {
    // Le prix unitaire du carburant/kWh en Europe est typiquement entre 0.15 et 3.5
    const found = sorted.find((n) => n >= 0.15 && n <= 3.5);
    if (found) {
      unitPrice = found;
    }
  }

  if (!quantity && totalPrice && unitPrice) {
    quantity = +(totalPrice / unitPrice).toFixed(2);
  } else if (!quantity && sorted.length > 1) {
    // Si la quantité n'est pas explicite, on cherche un nombre intermédiaire restant
    const other = sorted.find((n) => n !== totalPrice && n !== unitPrice);
    if (other) {
      quantity = other;
    }
  }

  // Double vérification de la cohérence : total doit être supérieur au prix unitaire
  if (totalPrice && unitPrice && totalPrice < unitPrice) {
    const temp = totalPrice;
    totalPrice = unitPrice;
    unitPrice = temp;
  }

  // Recalcul de la quantité si elle n'a pas pu être trouvée ou s'avère nulle
  if (totalPrice && unitPrice && !quantity) {
    quantity = +(totalPrice / unitPrice).toFixed(2);
  }

  return {
    quantity: quantity || 0,
    unitPrice: unitPrice || 0,
    totalPrice: totalPrice || 0,
  };
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
  
  let stationName = '';
  
  // 1. Chercher d'abord dans les 4 premières lignes avec des frontières de mots (\b)
  const firstLinesText = lines.slice(0, 4).join('\n');
  for (const k of known) {
    const regex = new RegExp(`\\b${k}\\b`, 'i');
    if (regex.test(firstLinesText)) {
      stationName = k;
      break;
    }
  }

  // 2. Sinon, chercher dans tout le texte avec des frontières de mots
  if (!stationName) {
    for (const k of known) {
      const regex = new RegExp(`\\b${k}\\b`, 'i');
      if (regex.test(text)) {
        stationName = k;
        break;
      }
    }
  }

  // 3. Fallback absolu si toujours pas trouvé
  if (!stationName) {
    for (const k of known) {
      if (text.toLowerCase().includes(k.toLowerCase())) {
        stationName = k;
        break;
      }
    }
  }

  if (!stationName) {
    stationName = lines[0] ?? '';
  }

  // Recherche d'un code postal français (5 chiffres) suivi d'une ville sans inclure les sauts de ligne
  const cityMatch = text.match(/\b\d{5}[ \t]+([A-ZÀ-Ÿa-zÀ-ÿ][A-ZÀ-Ÿa-zÀ-ÿ' \t-]{1,30})/i);
  const stationCity = cityMatch?.[1]?.trim() ?? '';
  return { stationName, stationCity };
}
