import { CheckoutButton } from './pricing/checkout-button';
import { Link } from '@/lib/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import {
  ScanLine,
  ShieldCheck,
  TrendingUp,
  Map,
  Leaf,
  Sparkles,
  ArrowRight,
  Camera,
  Wrench,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="flex-1">
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}

function Hero() {
  const t = useTranslations('landing.hero');
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-veloce/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-veloce/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-eco/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container relative pt-12 pb-16 sm:pt-20 sm:pb-32 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="space-y-5 sm:space-y-6">
          <Badge variant="premium" className="text-xs">
            <Sparkles className="h-3 w-3" /> {t('badge')}
          </Badge>
          <h1 className="font-display text-[2.25rem] sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] [text-wrap:balance]">
            {t('titleLead')}{' '}
            <span className="text-gradient-veloce">{t('titleHighlight')}</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="xl" asChild>
              <Link href="/signup">
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/dashboard">{t('ctaSecondary')}</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 text-xs text-muted-foreground">
            <div>{t('rating')}</div>
            <div>{t('users')}</div>
            <div>{t('trial')}</div>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  const t = useTranslations('landing.hero');
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-tr from-veloce/20 via-transparent to-eco/20 blur-3xl pointer-events-none" />
      <Card variant="premium" className="relative p-2 rotate-1">
        <div className="rounded-card overflow-hidden bg-anthra">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('demoTitle')}
                </div>
                <div className="font-mono text-3xl font-bold tabular-nums mt-1">
                  0,184 <span className="text-sm text-muted-foreground">€/km</span>
                </div>
              </div>
              <Badge variant="success">↘ {t('demoTrend')}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-btn bg-card p-3">
                <div className="text-muted-foreground">{t('demoEnergy')}</div>
                <div className="font-mono font-semibold mt-1">219 €</div>
              </div>
              <div className="rounded-btn bg-card p-3">
                <div className="text-muted-foreground">{t('demoMaintenance')}</div>
                <div className="font-mono font-semibold mt-1">184 €</div>
              </div>
              <div className="rounded-btn bg-card p-3">
                <div className="text-muted-foreground">{t('demoInsurance')}</div>
                <div className="font-mono font-semibold mt-1">78 €</div>
              </div>
            </div>
            <div className="rounded-btn bg-eco/10 border border-eco/20 p-3 flex items-center gap-3">
              <Leaf className="h-4 w-4 text-eco" />
              <div className="text-xs">
                <div className="font-medium text-eco">{t('demoEcoScore')}</div>
                <div className="text-muted-foreground">{t('demoEcoDelta')}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function HowItWorks() {
  const t = useTranslations('landing.howItWorks');
  const steps = [
    { icon: Wrench, title: t('step1Title'), desc: t('step1Description') },
    { icon: Camera, title: t('step2Title'), desc: t('step2Description') },
    { icon: TrendingUp, title: t('step3Title'), desc: t('step3Description') },
  ];
  return (
    <section className="container py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 relative">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative text-center space-y-3">
              <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-gradient-veloce flex items-center justify-center text-white font-mono text-xl shadow-glow-veloce">
                {i + 1}
              </div>
              <div className="rounded-btn bg-veloce/10 text-veloce w-12 h-12 mx-auto -mt-1 flex items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Features() {
  const t = useTranslations('landing.features');
  const features = [
    { icon: ScanLine, title: t('ocrTitle'), description: t('ocrDescription') },
    { icon: ShieldCheck, title: t('logTitle'), description: t('logDescription') },
    { icon: TrendingUp, title: t('resaleTitle'), description: t('resaleDescription') },
    { icon: Map, title: t('mapTitle'), description: t('mapDescription') },
    { icon: Leaf, title: t('ecoTitle'), description: t('ecoDescription') },
    { icon: Sparkles, title: t('predictTitle'), description: t('predictDescription') },
  ];
  return (
    <section id="features" className="container py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="p-6 hover:-translate-y-0.5 transition-transform">
              <div className="rounded-btn bg-veloce/10 text-veloce w-10 h-10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function Testimonials() {
  const t = useTranslations('landing.testimonials');
  const ts = [
    { quote: t('t1Quote'), author: t('t1Author'), role: t('t1Role') },
    { quote: t('t2Quote'), author: t('t2Author'), role: t('t2Role') },
    { quote: t('t3Quote'), author: t('t3Author'), role: t('t3Role') },
  ];
  return (
    <section className="container py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {ts.map((tt, i) => (
          <Card key={i} variant="glass" className="p-6 flex flex-col">
            <div className="text-veloce text-2xl leading-none mb-3">&ldquo;</div>
            <p className="text-sm flex-1 leading-relaxed">{tt.quote}</p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="font-display font-semibold text-sm">{tt.author}</div>
              <div className="text-xs text-muted-foreground">{tt.role}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const t = useTranslations('pricing');
  const tFeatures = useTranslations('landing.features');

  const standardFeatures = [
    '3 scans OCR offerts/mois',
    'Rappels d\'entretien de base',
    'Carte des stations',
    '1 véhicule',
  ];
  const premiumFeatures = [
    'OCR illimité',
    'Suivi TCO complet',
    'Export fiscal (frais réels)',
    tFeatures('logTitle'),
    tFeatures('resaleTitle'),
    tFeatures('ecoTitle'),
    'Véhicules illimités',
  ];
  const fleetFeatures = [
    "Jusqu'à 5 véhicules",
    'Gestion multi-comptes',
    'Export comptable consolidé',
    'Support prioritaire',
    'Toutes les fonctions Pro'
  ];
  const partnerFeatures = [
    'Visibilité prioritaire',
    'Génération de leads',
    'Prise de RDV intégrée',
    'Profil garage enrichi',
    'Statistiques de visites',
  ];

  return (
    <section id="pricing" className="container py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="premium">
          <Sparkles className="h-3 w-3" /> {t('noAds')}
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-4">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
            <span className="font-mono text-4xl font-bold tabular-nums">9,99</span>
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
          <div className="font-display text-lg font-semibold">{t('fleetName')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('fleetDescription')}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold tabular-nums">{t('fleetPrice')}</span>
            <span className="text-muted-foreground">{t('fleetPerMonth')}</span>
          </div>
          <div className="text-xs text-eco mt-1">{t('fleetPerYear')}</div>
          <ul className="mt-6 space-y-2.5 flex-1">
            {fleetFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-eco shrink-0 mt-0.5" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/signup">{t('fleetCta')}</Link>
          </Button>
        </Card>

        <Card className="p-8 flex flex-col">
          <div className="font-display text-lg font-semibold">{t('partnerName')}</div>
          <p className="text-sm text-muted-foreground mt-1">{t('partnerDescription')}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold tabular-nums">
              {t('partnerPrice')}
            </span>
            <span className="text-muted-foreground">{t('partnerPerMonth')}</span>
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
    </section>
  );
}

function FAQ() {
  const t = useTranslations('landing.faq');
  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') },
  ];
  return (
    <section className="container py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-card border border-border bg-card overflow-hidden"
          >
            <summary className="cursor-pointer p-5 flex items-start gap-3 hover:bg-muted/30 transition-colors list-none">
              <span className="rounded-btn bg-veloce/10 text-veloce w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono">
                {i + 1}
              </span>
              <span className="flex-1 font-display font-medium">{item.q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition-transform shrink-0">+</span>
            </summary>
            <div className="px-5 pb-5 ps-14 text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  const tCta = useTranslations('landing.cta');
  return (
    <section className="container py-14 sm:py-20">
      <Card variant="premium" className="p-6 sm:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,122,255,0.2),transparent_50%)] pointer-events-none" />
        <div className="relative">
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight [text-wrap:balance]">
            {tCta('title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
            {tCta('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center items-center">
            <Button size="xl" asChild className="w-full sm:w-auto">
              <Link href="/signup">
                {tCta('button')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-eco" strokeWidth={2} />
              <span>30j · sans engagement · sans publicité</span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
