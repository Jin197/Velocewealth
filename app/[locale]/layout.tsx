import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, locales, defaultLocale } from '@/lib/i18n/routing';
import { ChatbotWidget } from '@/components/domain/chatbot-widget';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'common' });
  const tLanding = await getTranslations({ locale, namespace: 'landing.hero' });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velocewealth.app';

  return {
    title: {
      default: `Velocewealth — ${t('tagline')}`,
      template: '%s · Velocewealth',
    },
    description: tLanding('subtitle'),
    alternates: {
      canonical:
        locale === defaultLocale ? `${base}/` : `${base}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          l === defaultLocale ? `${base}/` : `${base}/${l}`,
        ]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale,
      title: `Velocewealth — ${t('tagline')}`,
      description: tLanding('subtitle'),
      url: locale === defaultLocale ? `${base}/` : `${base}/${locale}`,
      siteName: 'Velocewealth',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Velocewealth — ${t('tagline')}`,
      description: tLanding('subtitle'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <StructuredData />
      {children}
      <ChatbotWidget />
    </NextIntlClientProvider>
  );
}

function StructuredData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://velocewealth.app';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Velocewealth',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '12000',
    },
    url: base,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
