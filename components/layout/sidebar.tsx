'use client';

import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Car,
  Fuel,
  Wrench,
  Map,
  Leaf,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { logoutAction } from '@/server/actions/auth';
import { Logo } from './logo';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser } from '@/components/user-context';

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useUser();
  const t = useTranslations('nav');

  const nav = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/vehicles', label: t('vehicles'), icon: Car },
    { href: '/fuel', label: t('fuel'), icon: Fuel },
    { href: '/maintenance', label: t('maintenance'), icon: Wrench },
    { href: '/map', label: t('map'), icon: Map },
    { href: '/eco-score', label: t('ecoScore'), icon: Leaf },
  ] as const;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-sm">
      <div className="p-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-veloce/10 text-veloce font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.5} size={18} />
              {item.label}
              {active && (
                <span className="ms-auto h-1.5 w-1.5 rounded-full bg-veloce" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-2">
        {currentUser.planTier === 'free' && (
          <Link
            href="/settings/billing"
            className="block glass-premium rounded-card p-4 text-sm hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              <Sparkles className="h-4 w-4 text-veloce" strokeWidth={1.5} />
              Premium
            </div>
          </Link>
        )}

        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Settings className="h-4.5 w-4.5" strokeWidth={1.5} size={18} />
          {t('settings')}
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.5} size={18} />
            {t('logout')}
          </button>
        </form>

        <Link
          href="/settings/profile"
          className="flex items-center gap-3 rounded-btn p-2 hover:bg-muted transition-colors"
        >
          <Avatar name={currentUser.fullName} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">
              {currentUser.fullName}
            </div>
            <div className="flex items-center gap-1.5">
              {currentUser.planTier === 'premium' && (
                <Badge variant="premium" className="text-[10px] px-1.5 py-0">
                  Premium
                </Badge>
              )}
              <span className="text-xs text-muted-foreground truncate">
                {currentUser.email}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
