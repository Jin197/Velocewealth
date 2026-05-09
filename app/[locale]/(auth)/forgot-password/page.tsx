'use client';

import { Link } from '@/lib/i18n/routing';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { Card } from '@/components/ui/card';
import { forgotPasswordAction } from '@/server/actions/auth';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await forgotPasswordAction(formData);
      if (res.error) setError(res.error);
      else setSent(true);
    });
  };

  if (sent) {
    return (
      <Card variant="glass" className="p-6 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-eco mx-auto" strokeWidth={1.5} />
        <h1 className="font-display text-lg font-semibold">{t('forgotSent')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('forgotSentDescription')}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t('backToLogin')}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ms-3">
        <Link href="/login">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t('signIn')}
        </Link>
      </Button>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('forgotTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('forgotSubtitle')}</p>
      </div>
      <form action={handleSubmit} className="space-y-4">
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
        <FormError message={error} />
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('forgotButton')}
        </Button>
      </form>
    </div>
  );
}
