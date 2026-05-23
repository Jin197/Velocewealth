'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/routing';

export const STORAGE_KEY = 'velocewealth-cookies-acknowledged';

export function CookieBanner() {
  const t = useTranslations('cookies');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ack = localStorage.getItem(STORAGE_KEY);
    if (!ack) setShow(true);
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(STORAGE_KEY, 'refused');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-2xl">
      <div className="rounded-card border border-border bg-[#16161A]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 flex items-start gap-4">
        <div className="rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] p-3 shrink-0">
          <Cookie className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm text-white">{t('title')}</div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t('description')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={handleAccept} className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full px-4 font-semibold shadow-[0_0_15px_rgba(0,122,255,0.3)]">
              {t('acceptAll') || 'Tout accepter'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleRefuse} className="border-white/10 hover:bg-white/5 text-[#F5F5F7] rounded-full px-4">
              {t('refuseAll') || 'Refuser les cookies optionnels'}
            </Button>
            <Button size="sm" variant="ghost" asChild className="text-muted-foreground hover:text-[#F5F5F7]">
              <Link href="/legal/cookies">{t('manage')}</Link>
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefuse}
          className="text-muted-foreground hover:text-white shrink-0 p-1 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

