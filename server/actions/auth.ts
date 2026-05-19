'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

const credentialsSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (6 min)'),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(1, 'Nom requis').max(80),
  country: z.string().trim().min(2).max(3).default('FR'),
  currency: z.string().trim().min(3).max(3).default('EUR'),
  locale: z.enum(['fr', 'en', 'es', 'ar', 'pt']).default('fr'),
});

export type AuthResult = { error?: string; ok?: boolean };

const NOT_CONFIGURED = {
  error:
    'Backend non configuré. Renseigne tes clés Supabase dans .env.local — voir ONBOARDING.md.',
} as const;

export async function loginAction(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signupAction(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    country: formData.get('country') ?? 'FR',
    currency: formData.get('currency') ?? 'EUR',
    locale: formData.get('locale') ?? 'fr',
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        country: parsed.data.country,
        currency: parsed.data.currency,
        locale: parsed.data.locale,
      },
    },
  });
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function forgotPasswordAction(
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const email = z.string().email().safeParse(formData.get('email'));
  if (!email.success) return { error: 'Email invalide' };
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=/settings/security`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signInWithProvider(
  provider: 'google' | 'apple',
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { url: data.url };
}
