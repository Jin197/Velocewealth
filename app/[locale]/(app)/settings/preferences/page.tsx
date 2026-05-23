'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { locales, localeLabels, localeFlags, type Locale } from '@/lib/i18n/routing';
import { useTransition } from 'react';
import { updateLocaleAction } from '@/server/actions/profile';

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;
    startTransition(async () => {
      await updateLocaleAction(nextLocale);
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold">Apparence</h2>
          <p className="text-xs text-muted-foreground">
            Mode sombre par défaut, optimal pour le scan OCR
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { value: 'light', label: 'Clair', icon: Sun },
            { value: 'dark', label: 'Sombre', icon: Moon },
            { value: 'system', label: 'Système', icon: Monitor },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'rounded-card border p-4 flex flex-col items-center gap-2 transition-colors',
                  active
                    ? 'border-veloce bg-veloce/10 text-veloce'
                    : 'border-border hover:bg-muted',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold">Langue</h2>
          <p className="text-xs text-muted-foreground">
            Choisissez la langue d&apos;affichage de l&apos;interface de l&apos;application
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {locales.map((l) => {
            const active = currentLocale === l;
            return (
              <button
                key={l}
                type="button"
                disabled={isPending}
                onClick={() => handleLanguageChange(l)}
                className={cn(
                  'rounded-card border p-4 flex flex-col items-center justify-center gap-2 transition-colors relative',
                  active
                    ? 'border-veloce bg-veloce/10 text-veloce font-semibold'
                    : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground',
                  isPending && 'opacity-60 cursor-not-allowed'
                )}
              >
                <span className="text-2xl" role="img" aria-label={localeLabels[l]}>
                  {localeFlags[l]}
                </span>
                <span className="text-xs font-medium text-center">{localeLabels[l]}</span>
                {active && (
                  <span className="absolute top-2 right-2 rounded-full bg-veloce text-white p-0.5 shadow-sm">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold">Unités</h2>
          <p className="text-xs text-muted-foreground">
            Définissez vos unités de mesure préférées
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="distance">Distance</Label>
            <Select id="distance" defaultValue="km">
              <option value="km">Kilomètres</option>
              <option value="mi">Miles</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="volume">Volume</Label>
            <Select id="volume" defaultValue="L">
              <option value="L">Litres</option>
              <option value="gal">Gallons</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conso">Consommation</Label>
            <Select id="conso" defaultValue="L100">
              <option value="L100">L / 100 km</option>
              <option value="mpg">MPG</option>
              <option value="kWh100">kWh / 100 km</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Enregistrer</Button>
      </div>
    </div>
  );
}
