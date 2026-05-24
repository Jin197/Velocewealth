'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/lib/i18n/routing';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { useLocale } from 'next-intl';

interface LandingHeaderProps {
  tNav: {
    features: string;
    pricing: string;
    partners: string;
    login: string;
    signup: string;
  };
}

export function LandingHeader({ tNav }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl transition-all duration-500 ease-out rounded-full ${
        scrolled
          ? 'bg-[#0D0D12]/70 backdrop-blur-xl border border-[#C5A059]/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-2 px-6'
          : 'bg-transparent border border-transparent py-4 px-4'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 transition-transform duration-300 hover:scale-[1.02]">
          <Logo wordmarkResponsive />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/#features"
            className="text-muted-foreground transition-colors hover:text-[#007AFF] relative group py-1"
          >
            {tNav.features}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#007AFF] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/#pricing"
            className="text-muted-foreground transition-colors hover:text-[#007AFF] relative group py-1"
          >
            {tNav.pricing}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#007AFF] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/help"
            className="text-muted-foreground transition-colors hover:text-[#007AFF] relative group py-1"
          >
            {tNav.partners}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#007AFF] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link href="/login">{tNav.login}</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full font-semibold shadow-[0_0_20px_rgba(0,122,255,0.4)] hover:shadow-[0_0_25px_rgba(0,122,255,0.6)] transition-all duration-300 px-3 sm:px-4 shrink-0"
          >
            <Link href="/signup">
              <span className="inline sm:hidden">
                {locale === 'fr' ? 'Essayer' : locale === 'es' ? 'Probar' : locale === 'ar' ? 'ابدأ' : locale === 'pt' ? 'Testar' : 'Try'}
              </span>
              <span className="hidden sm:inline">
                {tNav.signup}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
