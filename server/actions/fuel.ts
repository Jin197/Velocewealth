'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { fuelEntryInputSchema } from '@/lib/validators/fuel';
import type { ActionResult } from './profile';

const NOT_CONFIGURED: ActionResult = {
  error: 'Backend non configuré. Voir ONBOARDING.md.',
};

export async function addFuelEntryAction(
  formData: FormData,
): Promise<ActionResult & { id?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const parsed = fuelEntryInputSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }
  const f = parsed.data;

  // Verify vehicle belongs to user (defence in depth — RLS already guards this)
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', f.vehicleId)
    .eq('user_id', user.id)
    .single();
  if (!vehicle) return { error: 'Véhicule introuvable' };

  const { data, error } = await supabase
    .from('fuel_entries')
    .insert({
      vehicle_id: f.vehicleId,
      user_id: user.id,
      occurred_at: f.occurredAt,
      energy_type: f.energyType,
      quantity: f.quantity,
      unit: f.energyType === 'electric' ? 'kWh' : 'L',
      unit_price: f.unitPrice,
      total_price: f.totalPrice,
      currency: f.currency,
      station_name: f.stationName,
      station_city: f.stationCity || null,
      mileage_km: f.mileageKm,
      ocr_source: f.ocrSource,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/fuel');
  revalidatePath(`/vehicles/${f.vehicleId}`);
  return { ok: true, id: data.id };
}

export async function deleteFuelEntryAction(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };
  const { error } = await supabase
    .from('fuel_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/fuel');
  return { ok: true };
}
