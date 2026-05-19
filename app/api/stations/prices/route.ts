import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius') || '5000', 10); // Rayon en mètres

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude (lat) et longitude (lng) requises.' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    
    // Requête RPC vers Supabase (utilise PostGIS st_dwithin en arrière-plan)
    const { data: nearbyStations, error } = await (supabase as any).rpc('get_nearby_stations', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radius
    });

    if (error) {
      throw error;
    }

    // Fluctuations aléatoires basées sur le jour pour simuler les prix en temps réel
    // (Dans une version 100% full stack, ces prix viendraient d'une table `fuel_prices` mise à jour quotidiennement)
    const todayVariation = (new Date().getDay() % 3) * 0.02;

    const stationsWithMockedPrices = ((nearbyStations as any[]) || []).map((st: any) => ({
      ...st,
      prices: st.type === 'gas' ? {
        'SP95-E10': (1.82 + todayVariation).toFixed(3),
        'Gazole': (1.71 + todayVariation).toFixed(3),
        'SP98': (1.95 + todayVariation).toFixed(3),
      } : {
        'DC 350kW': '0.590', // € / kWh
      },
      updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    }));

    return NextResponse.json({
      location: { lat, lng },
      radius,
      stations: stationsWithMockedPrices,
    });

  } catch (error) {
    console.error('Erreur API Stations (PostGIS):', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stations.' },
      { status: 500 }
    );
  }
}
