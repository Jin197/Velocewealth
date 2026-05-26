import { getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params;
  const profile = isSupabaseConfigured() ? await getProfile() : null;

  // Si l'onboarding est déjà complété, rediriger directement vers le dashboard
  if (profile?.hasCompletedOnboarding) {
    redirect('/dashboard');
  }

  // Utilisateur fictif pour le mode démo / pré-prod
  const initialUser = profile || {
    id: 'mock-user-id',
    fullName: 'Investisseur Veloce',
    email: 'investisseur@velocewealth.app',
    locale: locale as any,
    currency: 'EUR' as any,
    country: 'FR',
    planTier: 'premium' as any,
    hasCompletedOnboarding: false,
  };

  return <OnboardingClient initialUser={initialUser} locale={locale} />;
}
