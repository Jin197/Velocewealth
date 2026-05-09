import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR',
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale: string = 'fr-FR',
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDistance(km: number, locale: string = 'fr-FR') {
  return `${formatNumber(km, locale, { maximumFractionDigits: 0 })} km`;
}

export function formatDate(date: Date | string, locale: string = 'fr-FR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | string, locale: string = 'fr-FR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diff < 60) return rtf.format(-Math.round(diff), 'second');
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  if (diff < 2592000) return rtf.format(-Math.round(diff / 86400), 'day');
  if (diff < 31536000) return rtf.format(-Math.round(diff / 2592000), 'month');
  return rtf.format(-Math.round(diff / 31536000), 'year');
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
