'use client';

import { HelpCenterContent } from '@/components/help/help-center-content';

export default function HelpPage({ params }: { params?: { locale?: string } }) {
  const locale = params?.locale || 'fr';
  const currentLocale = locale === 'fr' ? 'fr' : 'en';

  return <HelpCenterContent currentLocale={currentLocale} backUrl="/" />;
}
