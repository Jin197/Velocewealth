import { Link } from '@/lib/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { CookieBanner } from '@/components/cookie-banner';

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {children}
      <Footer />
      <CookieBanner />
    </div>
  );
}

function Header() {
  const tNav = useTranslations('nav');
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="shrink-0">
          <Logo wordmarkResponsive />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground">
            {tNav('features')}
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            {tNav('pricing')}
          </Link>
          <Link href="/#partners" className="text-muted-foreground hover:text-foreground">
            {tNav('partners')}
          </Link>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">{tNav('login')}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">{tNav('signup')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  return (
    <footer className="border-t border-border mt-16 sm:mt-24">
      <div className="container py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div className="space-y-3 sm:col-span-2 md:col-span-1">
          <Logo />
          <p className="text-muted-foreground text-xs leading-relaxed">{t('tagline')}</p>
        </div>
        <div>
          <div className="font-display font-semibold mb-3">{t('product')}</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/#features" className="hover:text-foreground">{tNav('features')}</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground">{tNav('pricing')}</Link></li>
            <li><Link href="/login" className="hover:text-foreground">{tNav('login')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-3">{t('legal')}</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/legal/terms" className="hover:text-foreground">{t('termsLink')}</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-foreground">{t('privacyLink')}</Link></li>
            <li><Link href="/legal/imprint" className="hover:text-foreground">{t('mentionsLink')}</Link></li>
            <li><Link href="/legal/cookies" className="hover:text-foreground">{t('cookiesLink')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-3">{t('languages')}</div>
          <LocaleSwitcher variant="inline" />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
          <span>{t('copyright')}</span>
          <span>{t('rights')}</span>
        </div>
      </div>
    </footer>
  );
}
