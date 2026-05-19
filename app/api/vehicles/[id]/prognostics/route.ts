import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateVehicleHealth, TelemetryData } from '@/lib/phm/engine';
import { getVehicle } from '@/lib/data';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicleId = params.id;
    
    // 1. Fetch Vehicle Profile & Mileage
    const vehicle = await getVehicle(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // 2. Fetch Latest Telemetry (Cold Start data)
    // We try to fetch the most recent telemetry row for this vehicle
    const { data: telemetryData, error: telemetryError } = await supabase
      .from('telemetry_obd' as any)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('time', { ascending: false })
      .limit(1)
      .single();

    // Mapping to our Engine interface (if no data, pass null)
    let latestTelemetry: TelemetryData | null = null;
    if (telemetryData) {
      latestTelemetry = {
        rpm: (telemetryData as any).rpm || 0,
        engineLoad: (telemetryData as any).engine_load || 0,
        speed: (telemetryData as any).speed || 0,
        maf: (telemetryData as any).maf || 0,
        iat: (telemetryData as any).iat || 0,
        coolantTemp: (telemetryData as any).coolant_temp || 0,
        batteryVoltage: (telemetryData as any).battery_voltage || 12.0
      };
    }

    // 3. Fetch Maintenance History to get 'lastChangedKm'
    // For this MVP, we simulate having parsed the history for these 3 critical components
    // In a real scenario, we would query the `maintenance_entries` table.
    
    const { data: maintenanceHistory } = await supabase
      .from('maintenance_entries')
      .select('category, mileage_km, occurred_at')
      .eq('vehicle_id', vehicleId)
      .order('occurred_at', { ascending: false });

    // Helper to find the last time a category was serviced
    const getLastServiceKm = (category: string, defaultAgeKm: number) => {
      const entry = maintenanceHistory?.find(m => m.category === category);
      return entry ? entry.mileage_km : Math.max(0, vehicle.currentMileageKm - defaultAgeKm);
    };

    // Construct the Components data for the PHM Engine
    // Expected lifetimes are based on generic manufacturer Weibull beta=2 estimates
    const componentsData = [
      {
        name: 'Filtre à Air',
        lastChangedKm: getLastServiceKm('filter', 20000), 
        expectedLifetimeKm: 30000 
      },
      {
        name: 'Plaquettes de Frein Avant',
        lastChangedKm: getLastServiceKm('brakes', 30000),
        expectedLifetimeKm: 40000
      },
      {
        name: 'Huile Moteur',
        lastChangedKm: getLastServiceKm('oil', 10000),
        expectedLifetimeKm: 15000
      },
      {
        name: 'Pneumatiques',
        lastChangedKm: getLastServiceKm('tires', 25000),
        expectedLifetimeKm: 45000
      }
    ];

    // 4. Run the Machine Learning / PHM Engine
    const prognostics = evaluateVehicleHealth(
      vehicle.currentMileageKm,
      latestTelemetry,
      componentsData
    );

    // 5. Return the JSON payload matching the architectural spec
    return NextResponse.json({
      vehicle_id: vehicleId,
      current_mileage_km: vehicle.currentMileageKm,
      overall_health_score: prognostics.overallScore,
      components: prognostics.components,
      last_telemetry_time: telemetryData ? (telemetryData as any).time : null
    });

  } catch (error: any) {
    console.error('Prognostics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
