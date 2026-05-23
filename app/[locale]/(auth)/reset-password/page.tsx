'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { Card } from '@/components/ui/card';
import { resetPasswordAction } from '@/server/actions/auth';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await resetPasswordAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <Card variant="glass" className="p-6 text-center space-y-4 border-eco/20 bg-eco/5">
        <CheckCircle2 className="h-10 w-10 text-eco mx-auto animate-bounce" strokeWidth={1.5} />
        <div className="space-y-1">
          <h1 className="font-display text-lg font-semibold text-white">
            {t('resetPasswordSuccess')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('resetPasswordSuccessDescription')}
          </p>
        </div>
        <div className="pt-2">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-eco animate-pulse" style={{ width: '100%', transition: 'width 3s linear' }} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('resetPasswordSubtitle')}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('passwordLabelNew')}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="ps-9"
              required
              disabled={pending}
            />
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('resetPasswordButton')}
        </Button>
      </form>
    </div>
  );
}
