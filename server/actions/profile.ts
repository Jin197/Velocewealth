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

