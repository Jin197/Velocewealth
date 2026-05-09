'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Logo } from './logo';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/user-context';

export function Topbar({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const currentUser = useUser();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-8">
      <div className="lg:hidden">
        <Logo showWordmark={false} />
      </div>
      {title && (
        <h1 className="hidden lg:block font-display text-xl font-semibold tracking-tight">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            placeholder="Rechercher…"
            className="h-9 w-56 rounded-btn border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Basculer thème"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          )}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-eco" />
        </Button>
        <div className="lg:hidden">
          <Avatar name={currentUser.fullName} size="sm" />
        </div>
      </div>
    </header>
  );
}
