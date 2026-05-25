'use client';

import { useEffect, useState } from 'react';
import { Cookie, Shield, Lock } from 'lucide-react';

export const STORAGE_KEY = 'vw-cookie-consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === null) {
      setShow(true);
    }
  }, []);

  if (!mounted || !show) return null;

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    window.dispatchEvent(new Event('cookie-consent-updated'));
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur with smooth fade-in */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ease-out animate-in fade-in"
        onClick={handleRefuse}
      />

      {/* Centered Modal Card with rounded-[2rem] and Slate Minimal Pro styling */}
      <div className="relative w-full max-w-lg bg-[#16161A] border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col gap-6 overflow-hidden animate-in fade-in zoom-in-95 duration-500 ease-out z-10">
        
        {/* Premium background decorative blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#007AFF]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <div className="rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] p-3.5 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
            <Cookie className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight leading-snug max-w-md">
            Nous respectons votre vie privée et la sécurité de vos données automobiles
          </h2>
        </div>

        {/* Description Section with beautiful visual cues */}
        <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed z-10 font-sans">
          <p>
            VeloceWealth utilise des cookies essentiels pour assurer le bon fonctionnement de la plateforme (comme la mémorisation de votre session sécurisée).
          </p>
          <p>
            Avec votre accord, nous et nos partenaires (notamment nos services de cartographie Mapbox et nos outils d'analyse de reçus par OCR) utilisons également des cookies pour mesurer l'audience du site, optimiser les performances techniques et vous proposer des services d'entretien de proximité adaptés à votre véhicule. Vous pouvez modifier vos préférences à tout moment.
          </p>

          {/* Bulleted list to make it look premium and structured like the example */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Lock className="h-4 w-4 text-[#007AFF] shrink-0" strokeWidth={1.5} />
              <div className="text-[10px] text-white font-medium">Cookies Essentiels (Actifs)</div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Shield className="h-4 w-4 text-[#2ECC71] shrink-0" strokeWidth={1.5} />
              <div className="text-[10px] text-white font-medium">Mapbox & OCR Sécurisés</div>
            </div>
          </div>
        </div>

        {/* Buttons (Double Choice Equal Size & Aligned Horizontally) */}
        <div className="grid grid-cols-2 gap-4 pt-2 z-10">
          <button
            type="button"
            onClick={handleRefuse}
            className="w-full bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-full transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-sm"
          >
            Refuser / Paramétrer
          </button>
          
          <button
            type="button"
            onClick={handleAccept}
            className="w-full bg-[#1F2937] hover:bg-[#111827] text-white border border-[#374151] text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-full transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-md shadow-black/35"
          >
            Tout accepter
          </button>
        </div>

        {/* Tiny DPO mention for ultimate GDPR compliance */}
        <div className="text-[10px] text-muted-foreground/60 text-center border-t border-white/5 pt-3 leading-relaxed z-10">
          Pour toute question relative à vos données, contactez notre DPO à{' '}
          <a href="mailto:dpo@velocewealth.app" className="text-[#007AFF] hover:underline">
            dpo@velocewealth.app
          </a>
        </div>

      </div>
    </div>
  );
}
