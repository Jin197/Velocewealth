'use client';

import { Link } from '@/lib/i18n/routing';
import { usePathname } from '@/lib/i18n/routing';
import { User, CreditCard, Bell, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { href: '/settings/profile', label: 'Profil', icon: User },
  { href: '/settings/billing', label: 'Abonnement', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/preferences', label: 'Préférences', icon: Globe },
  { href: '/settings/security', label: 'Sécurité', icon: Shield },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto w-full">
      <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight mb-6">
        Paramètres
      </h1>
      <div className="flex flex-col lg:grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="lg:sticky lg:top-20 lg:self-start overflow-hidden">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {sections.map((s) => {
              const active = pathname === s.href || (pathname === '/settings' && s.href === '/settings/profile');
              const Icon = s.icon;
              return (
                <li key={s.href} className="shrink-0">
                  <Link
                    href={s.href}
                    className={cn(
                      'flex items-center gap-2 rounded-btn px-3 py-2 text-sm whitespace-nowrap transition-colors',
                      active
                        ? 'bg-veloce/10 text-veloce font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
