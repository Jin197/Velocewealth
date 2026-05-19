import { NextResponse } from 'next/server';
import { lookupVehicle, detectInputType, isValidFrenchPlate } from '@/lib/vehicle-lookup/router';

/**
 * API Route: Vehicle Lookup — Routeur Intelligent International
 *
 * Accepte :
 * - ?plate=AA-123-AA  (plaque FR, UK, ou autre)
 * - ?vin=WVWZZZ3CZWE...  (VIN 17 caractères)
 * - ?q=<n'importe quoi>  (détection automatique)
 *
 * Cascade : Cache Redis → SIV/DVLA → NHTSA → Erreur gracieuse
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get('plate')?.toUpperCase().replace(/\s/g, '') || '';
  const vin = searchParams.get('vin')?.toUpperCase().replace(/\s/g, '') || '';
  const q = searchParams.get('q')?.toUpperCase().replace(/\s/g, '') || '';

  // Déterminer l'input principal
  const input = vin || plate || q;

  if (!input || input.length < 4) {
    return NextResponse.json(
      { error: "Plaque d'immatriculation ou VIN requis (min 4 caractères)." },
      { status: 400 }
    );
  }

  // ── Validation anti-abus côté serveur ──────────────────────────
  // Si c'est clairement une plaque FR, valider le format avant d'appeler l'API payante
  const inputType = detectInputType(input);
  if (inputType === 'plate-fr' && !isValidFrenchPlate(input)) {
    return NextResponse.json(
      { error: 'Format de plaque française invalide. Attendu : AA-123-AA.' },
      { status: 422 }
    );
  }

  // ── Routage intelligent ────────────────────────────────────────
  const response = await lookupVehicle(input);

  if (!response.success) {
    // Erreur avec suggestion de fallback pour le frontend
    const status = response.fallback === 'try-vin' ? 404 : 422;
    return NextResponse.json(
      {
        error: response.error,
        fallback: response.fallback,
        inputType: response.inputType,
      },
      { status }
    );
  }

  return NextResponse.json(response.data);
}
