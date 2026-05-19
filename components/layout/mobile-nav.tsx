'use client';

import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Car, Plus, Wrench, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const items = [
    { href: '/dashboard', label: t('home'), icon: LayoutDashboard, primary: false },
    { href: '/vehicles', label: t('vehicles'), icon: Car, primary: false },
    { href: '/fuel/scan', label: t('scan'), icon: Plus, primary: true },
    { href: '/maintenance', label: t('maintenance'), icon: Wrench, primary: false },
    { href: '/settings', label: t('profile'), icon: User, primary: false },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          if (item.primary) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-veloce text-white shadow-glow-veloce"
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-3 text-[10px] leading-tight',
                  active ? 'text-veloce' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="truncate max-w-[56px] text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
