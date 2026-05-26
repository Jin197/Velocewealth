'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';

export const STORAGE_KEY = 'vw-cookie-consent';

export function CookieBanner() {
  const t = useTranslations('cookies');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: true }));
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setMounted(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: false }));
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setMounted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#16161A]/95 border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out">
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Icone Securisée */}
          <div className="rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] p-4 shrink-0">
            <Cookie className="h-8 w-8 animate-pulse" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h2 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
              {t('title')}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Double Choix Égalitaire */}
          <div className="flex flex-row items-center gap-4 w-full pt-4">
            <button
              onClick={handleRefuse}
              className="flex-1 py-3 text-sm font-semibold rounded-full bg-white border border-neutral-300 text-neutral-900 transition-all duration-300 hover:bg-neutral-50 active:scale-[0.98] shadow-sm"
            >
              {t('refuseAll')}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-3 text-sm font-semibold rounded-full bg-[#1F2937] text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] shadow-md"
            >
              {t('acceptAll')}
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground/50 border-t border-white/5 w-full pt-4">
            {t('dpoMention')}
          </div>
        </div>
      </div>
    </div>
  );
}
