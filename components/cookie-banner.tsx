'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/routing';

const STORAGE_KEY = 'velocewealth-cookies-acknowledged';

export function CookieBanner() {
  const t = useTranslations('cookies');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ack = localStorage.getItem(STORAGE_KEY);
    if (!ack) setShow(true);
  }, []);

  if (!show) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-2xl">
      <div className="rounded-card border border-border bg-card/95 backdrop-blur-xl shadow-elevated p-4 flex items-start gap-3">
        <div className="rounded-btn bg-veloce/10 text-veloce p-2 shrink-0">
          <Cookie className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm">{t('title')}</div>
          <p className="text-xs text-muted-foreground mt-1">{t('description')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={accept}>
              {t('accept')}
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/legal/cookies">{t('manage')}</Link>
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={accept}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
