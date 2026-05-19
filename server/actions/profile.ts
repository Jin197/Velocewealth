'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { profileInputSchema } from '@/lib/validators/profile';

export type ActionResult = { ok?: boolean; error?: string };

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
  revalidatePath('/', 'layout');
  return { ok: true };
}
