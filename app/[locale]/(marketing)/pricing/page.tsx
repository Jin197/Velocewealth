import { Link } from '@/lib/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckoutButton } from './checkout-button';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingContent />;
}

function PricingContent() {
  const t = useTranslations('pricing');
  const tFeatures = useTranslations('landing.features');

  const standardFeatures = [
    'Suivi carburant manuel',
    'Rappels d\'entretien de base',
    'Carte des stations',
    '1 véhicule',
  ];
  const premiumFeatures = [
    tFeatures('ocrTitle'),
    'Suivi TCO complet',
    'Export fiscal (frais réels)',
    tFeatures('logTitle'),
    tFeatures('resaleTitle'),
    tFeatures('ecoTitle'),
    'Véhicules illimités',
  ];
  const partnerFeatures = [
    'Visibilité prioritaire',
    'Prise de RDV intégrée',
    'Profil garage enrichi',
    'Statistiques de visites',
    'Commission par transaction',
  ];

  return (
    <main className="container py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="premium">
          <Sparkles className="h-3 w-3" /> {t('noAds')}
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-4">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="p-8 flex flex-col">
          <div className="font-display text-lg font-semibold">{t('standardName')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('standardDescription')}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold tabular-nums">0</span>
            <span className="text-muted-foreground">€</span>
          </div>
          <ul className="mt-6 space-y-2.5 flex-1">
            {standardFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-eco shrink-0 mt-0.5" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/signup">{t('standardCta')}</Link>
          </Button>
        </Card>

        <Card variant="premium" className="p-8 flex flex-col relative">
          <Badge variant="premium" className="absolute -top-3 left-1/2 -translate-x-1/2">
            {t('mostChosen')}
          </Badge>
          <div className="font-display text-lg font-semibold">{t('premiumName')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('premiumDescription')}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold tabular-nums">4,99</span>
            <span className="text-muted-foreground">{t('premiumPerMonth')}</span>
          </div>
          <div className="text-xs text-eco mt-1">{t('premiumPerYear')}</div>
          <ul className="mt-6 space-y-2.5 flex-1">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-eco shrink-0 mt-0.5" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-2">
            <CheckoutButton interval="monthly" label={t('premiumCtaMonthly')} />
            <CheckoutButton
              interval="yearly"
              label={t('premiumCtaYearly')}
              variant="outline"
            />
          </div>
        </Card>

        <Card className="p-8 flex flex-col">
          <div className="font-display text-lg font-semibold">{t('partnerName')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('partnerDescription')}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold tabular-nums">
              {t('partnerPrice')}
            </span>
          </div>
          <ul className="mt-6 space-y-2.5 flex-1">
            {partnerFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-eco shrink-0 mt-0.5" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-8" asChild>
            <a href="mailto:partners@velocewealth.app">{t('partnerCta')}</a>
          </Button>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        {t('vatNote')}
      </p>
    </main>
  );
}
