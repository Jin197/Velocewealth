import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';

// Note: Configured to run maximum 60 seconds (Serverless limit)
export const maxDuration = 60;
// We define it as dynamic so Vercel does not cache it
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 501 });
    }

    // Protection par Token (optionnel, pour éviter les abus publics du worker)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queueName = 'telemetry_queue';
    const batchSize = 1000;

    // 1. Lire les éléments actuels de la file
    const items = await redis.lrange(queueName, 0, batchSize - 1);
    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'Queue is empty' });
    }

    // 2. Parse JSON elements
    const batch = items.map((item) => {
      // redis may return objects or strings depending on version/config
      return typeof item === 'string' ? JSON.parse(item) : item;
    });

    // 3. Bulk Insert into PostgreSQL via Supabase
    // We use the admin client or standard client to insert
    const supabase = createClient();
    const { error } = await supabase
      .from('telemetry_obd' as any)
      .insert(batch);

    if (error) {
      console.error('Bulk insert failed:', error);
      // We don't delete from queue if it fails, so we can retry later
      return NextResponse.json({ error: 'Failed to insert to DB' }, { status: 500 });
    }

    // 4. Remove processed items from the queue
    // LTRIM keeps elements from start to end. To remove the first `items.length` elements:
    await redis.ltrim(queueName, items.length, -1);

    return NextResponse.json({
      success: true,
      processed: items.length,
      message: `Bulk inserted ${items.length} telemetry records.`
    });

  } catch (error: any) {
    console.error('Process queue error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
