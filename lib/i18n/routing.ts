import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['fr', 'en', 'es', 'ar', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  pt: 'Português',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  ar: '🇸🇦',
  pt: '🇵🇹',
};

export const rtlLocales: Locale[] = ['ar'];
export const isRtl = (locale: string) => rtlLocales.includes(locale as Locale);

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /dashboard for fr, /en/dashboard for others
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
