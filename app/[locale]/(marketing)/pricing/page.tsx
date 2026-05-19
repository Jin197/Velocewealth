import { redirect } from '@/lib/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Rediriger vers la section pricing de la landing page
  redirect({ href: '/#pricing', locale });
}
