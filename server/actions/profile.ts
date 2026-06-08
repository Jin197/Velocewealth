'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { profileInputSchema, localeSchema } from '@/lib/validators/profile';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export type ActionResult = { ok?: boolean; error?: string; locale?: string };

const NOT_CONFIGURED: ActionResult = {
  error: 'Backend non configuré. Voir ONBOARDING.md.',
};

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const parsed = profileInputSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    locale: formData.get('locale'),
    currency: formData.get('currency'),
    country: formData.get('country'),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      locale: parsed.data.locale,
      currency: parsed.data.currency,
      country: parsed.data.country,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  // Sync the locale cookie so the change takes effect on the very next request.
  cookies().set(LOCALE_COOKIE_NAME, parsed.data.locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
  // Return the saved locale so the client can navigate to the matching URL
  // prefix — with localePrefix: 'as-needed', the URL is the source of truth
  // even when the cookie is present, so a navigation is required.
  return { ok: true, locale: parsed.data.locale };
}

/**
 * Persists the avatar URL on the user's profile after a successful upload
 * through /api/upload/avatar. Accepts either the public Supabase URL
 * returned by that endpoint, or an empty string to clear the avatar.
 */
export async function updateAvatarAction(
  avatarUrl: string | null,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const cleaned = avatarUrl?.trim() || null;
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: cleaned })
    .eq('id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function updateLocaleAction(
  locale: string,
): Promise<ActionResult> {
  const parsed = localeSchema.safeParse(locale);
  if (!parsed.success) {
    return { error: 'Locale invalide' };
  }

  // Always set the cookie — works whether the user is authenticated or not.
  // next-intl middleware reads this on every request to pick the active locale.
  cookies().set(LOCALE_COOKIE_NAME, parsed.data, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  // If authenticated, also persist to profile so the preference survives
  // cookie clearance and propagates across devices.
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ locale: parsed.data })
        .eq('id', user.id);
      if (error) return { error: error.message };
    }
  }

  revalidatePath('/', 'layout');
  return { ok: true, locale: parsed.data };
}

export async function saveOnboardingAnswersAction(answers: {
  onboardingPersona: 'collector' | 'daily' | 'fleet';
  onboardingObjective: 'tco' | 'phm' | 'resale';
  onboardingMotorization: 'hybrid' | 'electric' | 'thermal';
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true };
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_persona: answers.onboardingPersona,
      onboarding_objective: answers.onboardingObjective,
      onboarding_motorization: answers.onboardingMotorization,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function completeOnboardingAction(vehicleData: {
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate: string;
  fuelType: 'hybrid' | 'electric' | 'thermal';
  currentMileageKm: number;
  purchasePrice?: number;
  purchaseDate?: string;
  insuranceProvider?: string;
  insuranceMonthly?: number;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true };
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  // 1. Check for duplicates in active fleet (plate or VIN) in memory with normalized formatting
  const { data: activeVehicles, error: fetchError } = await supabase
    .from('vehicles')
    .select('id, plate, vin')
    .eq('user_id', user.id)
    .is('archived_at', null);

  if (fetchError) return { error: fetchError.message };

  const normalizeString = (str: string) => {
    return str.toUpperCase().replace(/[\s-]/g, '');
  };

  const cleanInputPlate = normalizeString(vehicleData.plate);
  const cleanInputVin = vehicleData.vin ? normalizeString(vehicleData.vin) : null;

  const isDuplicate = activeVehicles?.some(v => {
    const existingPlate = normalizeString(v.plate);
    const existingVin = v.vin ? normalizeString(v.vin) : null;
    return (
      existingPlate === cleanInputPlate ||
      (cleanInputVin && existingVin === cleanInputVin)
    );
  });

  if (isDuplicate) {
    // Self-healing: if the vehicle already exists (e.g. from a previous retry), 
    // skip inserting a duplicate and directly mark onboarding as completed.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        has_completed_onboarding: true
      })
      .eq('id', user.id);

    if (profileError) return { error: profileError.message };

    revalidatePath('/', 'layout');
    return { ok: true };
  }

  const today = new Date().toISOString().split('T')[0];
  const purchasePrice = vehicleData.purchasePrice ?? 0;
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .insert({
      user_id: user.id,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vin: vehicleData.vin || null,
      plate: vehicleData.plate,
      fuel_type: vehicleData.fuelType,
      purchase_date: vehicleData.purchaseDate || today,
      purchase_price: purchasePrice,
      currency: 'EUR',
      current_mileage_km: vehicleData.currentMileageKm,
      image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80',
      estimated_resale_value: purchasePrice > 0 ? Math.round(purchasePrice * 0.8) : undefined,
      resale_trend: 'stable',
      insurance_provider: vehicleData.insuranceProvider?.trim() || undefined,
      insurance_monthly: vehicleData.insuranceMonthly ?? undefined,
    });

  if (vehicleError) return { error: vehicleError.message };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      has_completed_onboarding: true
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

