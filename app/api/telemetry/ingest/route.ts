import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAnomaly } from '@/lib/phm/engine';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn('Upstash Redis non configuré. Mode fallback activé.');
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // Auth validation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vehicle_id, rpm, engine_load, speed, maf, iat, coolant_temp, battery_voltage, tire_pressure } = body;

    if (!vehicle_id) {
      return NextResponse.json({ error: 'vehicle_id is required' }, { status: 400 });
    }

    // 1. Ingest Data (Message Queue via Redis)
    const payload = {
      vehicle_id,
      rpm,
      engine_load,
      speed,
      maf,
      iat,
      coolant_temp,
      battery_voltage,
      tire_pressure,
      created_at: new Date().toISOString()
    };

    if (redis) {
      // Pousser dans la file d'attente
      await redis.lpush('telemetry_queue', payload);
    } else {
      // Fallback: Direct PostgreSQL insert si Redis n'est pas configuré
      const { error } = await supabase
        .from('telemetry_obd' as any)
        .insert(payload);

      if (error) {
        console.error('Error inserting telemetry (Fallback):', error);
      }
    }

    // 2. Real-time Anomaly Detection (Cold Start)
    const anomalyCheck = detectAnomaly({
      rpm: rpm || 0,
      engineLoad: engine_load || 0,
      speed: speed || 0,
      maf: maf || 0,
      iat: iat || 0,
      coolantTemp: coolant_temp || 0,
      batteryVoltage: battery_voltage || 12.0
    });

    // We can trigger an alert here (e.g. push notification or insert into alerts table)
    if (anomalyCheck.flag) {
      console.warn(`[PHM Engine] Anomaly detected for vehicle ${vehicle_id}:`, anomalyCheck.reason);
      // Optional: Insert into an alerts table or send an email
    }

    return NextResponse.json({ 
      success: true, 
      anomaly_detected: anomalyCheck.flag,
      anomaly_reason: anomalyCheck.reason
    });
    
  } catch (error: any) {
    console.error('Telemetry ingestion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
