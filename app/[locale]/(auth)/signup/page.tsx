'use client';

import { Link } from '@/lib/i18n/routing';
import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Lock, User, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { signupAction } from '@/server/actions/auth';

export default function SignupPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleSubmit = (formData: FormData) => {
    formData.set('locale', locale);
    startTransition(async () => {
      setError(undefined);
      const res = await signupAction(formData);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('signupTitle')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('signupSubtitle')}</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{t('fullNameLabel')}</Label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="fullName"
              name="fullName"
              placeholder={t('fullNamePlaceholder')}
              className="ps-9"
              required
              disabled={pending}
            />
          </div>
        </div>
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
          <Label htmlFor="password">{t('passwordLabel')}</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('passwordHint')}
              className="ps-9"
              required
              minLength={6}
              disabled={pending}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="country">{t('countryLabel')}</Label>
            <div className="relative">
              <Globe className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" strokeWidth={1.5} />
              <Select id="country" name="country" defaultValue="FR" className="ps-9" disabled={pending}>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="CA">Canada</option>
                <option value="MA">Maroc</option>
                <option value="SN">Sénégal</option>
                <option value="CI">Côte d&apos;Ivoire</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="ES">España</option>
                <option value="PT">Portugal</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">{t('currencyLabel')}</Label>
            <Select id="currency" name="currency" defaultValue="EUR" disabled={pending}>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="CAD">$ CAD</option>
              <option value="CHF">Fr CHF</option>
              <option value="MAD">DH MAD</option>
              <option value="XOF">F CFA</option>
            </Select>
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('signupButton')}
        </Button>

        <p className="text-xs text-muted-foreground">
          {t('termsAcceptance')}{' '}
          <Link href="/legal/terms" className="text-veloce hover:underline">
            {t('termsLink')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href="/legal/privacy" className="text-veloce hover:underline">
            {t('privacyLink')}
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-veloce hover:underline font-medium">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
