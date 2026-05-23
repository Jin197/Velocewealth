import { setRequestLocale } from 'next-intl/server';
import { LandingPageClient } from './landing-page-client';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPageClient locale={locale} />;
}

