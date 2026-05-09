'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={(theme as 'light' | 'dark') ?? 'dark'}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-card border border-border bg-card text-foreground shadow-elevated',
          title: 'font-display font-semibold',
          description: 'text-muted-foreground text-sm',
        },
      }}
    />
  );
}
