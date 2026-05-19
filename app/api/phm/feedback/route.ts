import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // Auth validation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, componentName, anomalyReason, isConfirmed } = body;

    if (!vehicleId || !componentName || isConfirmed === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert feedback into DB
    const { error } = await supabase
      .from('phm_feedback' as any)
      .insert({
        vehicle_id: vehicleId,
        component_name: componentName,
        anomaly_reason: anomalyReason || '',
        is_confirmed: isConfirmed
      });

    if (error) {
      console.error('Error inserting PHM feedback:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Feedback recorded successfully' });
    
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
