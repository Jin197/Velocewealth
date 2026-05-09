'use client';

import { Link } from '@/lib/i18n/routing';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Apple, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { loginAction, signInWithProvider } from '@/server/actions/auth';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleLogin = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await loginAction(formData);
      if (res?.error) setError(res.error);
    });
  };

  const handleOAuth = (provider: 'google' | 'apple') => {
    startTransition(async () => {
      const res = await signInWithProvider(provider);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('loginTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('loginSubtitle')}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => handleOAuth('google')}
          disabled={pending}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
            <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          {t('loginCta')} Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => handleOAuth('apple')}
          disabled={pending}
        >
          <Apple className="h-4 w-4" />
          {t('loginCta')} Apple
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground uppercase tracking-wider">
            {t('or')}
          </span>
        </div>
      </div>

      <form action={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              className="ps-9"
              required
              disabled={pending}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Link href="/forgot-password" className="text-xs text-veloce hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              className="ps-9"
              required
              disabled={pending}
            />
          </div>
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('loginButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/signup" className="text-veloce hover:underline font-medium">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
