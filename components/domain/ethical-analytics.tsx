'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { STORAGE_KEY } from '@/components/cookie-banner';

export function EthicalAnalytics() {
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkConsent = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsAccepted(false);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as { consent?: boolean };
        setIsAccepted(parsed.consent === true);
      } catch {
        setIsAccepted(false);
      }
    };

    checkConsent();

    window.addEventListener('cookie-consent-updated', checkConsent);
    return () => {
      window.removeEventListener('cookie-consent-updated', checkConsent);
    };
  }, []);

  if (!isAccepted) return null;

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <>
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
      {umamiWebsiteId && (
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
