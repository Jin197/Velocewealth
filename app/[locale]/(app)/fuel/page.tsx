import { Link } from '@/lib/i18n/routing';
import { Plus, ScanLine, Fuel as FuelIcon } from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { KpiCard } from '@/components/domain/kpi-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getFuelEntries, getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function FuelPage() {
  const fuelEntries = isSupabaseConfigured() ? await getFuelEntries() : [];
  const profile = isSupabaseConfigured() ? await getProfile() : null;
  const currency = profile?.currency ?? 'EUR';

  if (fuelEntries.length === 0) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <FuelIcon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            Aucune dépense énergie
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Scannez un ticket ou saisissez une recharge pour démarrer le suivi
            de votre coût au kilomètre.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href="/fuel/scan">
                <ScanLine className="h-4 w-4" /> Scanner un ticket
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/fuel/scan?manual=1">
                <Plus className="h-4 w-4" /> Saisie manuelle
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const total = fuelEntries.reduce((s, f) => s + f.totalPrice, 0);
  const electric = fuelEntries.filter((f) => f.energyType === 'electric');
  const thermal = fuelEntries.filter((f) => f.energyType !== 'electric');
  const thermalSum = thermal.reduce((s, f) => s + f.totalPrice, 0);

  const byMonth = fuelEntries.reduce<Record<string, typeof fuelEntries>>(
    (acc, e) => {
      const d = new Date(e.occurredAt);
      const key = d.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      });
      (acc[key] = acc[key] ?? []).push(e);
      return acc;
    },
    {},
  );

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Énergie"
        description="Tickets carburant et factures de recharge"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/fuel/scan">
                <ScanLine className="h-4 w-4" /> Scanner
              </Link>
            </Button>
            <Button asChild>
              <Link href="/fuel/scan?manual=1">
                <Plus className="h-4 w-4" /> Saisie manuelle
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total dépensé" value={total.toFixed(0)} unit={currency} />
        <KpiCard label="Pleins thermiques" value={String(thermal.length)} />
        <KpiCard
          label="Recharges électriques"
          value={String(electric.length)}
        />
        <KpiCard
          label="Économie élec."
          value={(thermalSum * 0.3).toFixed(0)}
          unit={currency}
          variant="premium"
        />
      </div>

      {Object.entries(byMonth).map(([month, entries]) => (
        <Section
          key={month}
          title={month.charAt(0).toUpperCase() + month.slice(1)}
        >
          <Card className="divide-y divide-border">
            {entries.map((e) => (
              <FuelEntryRow key={e.id} entry={e} />
            ))}
            <div className="p-3 flex items-center justify-between text-xs bg-muted/30">
              <span className="text-muted-foreground">
                {entries.length} entrée{entries.length > 1 ? 's' : ''}
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {formatCurrency(
                  entries.reduce((s, e) => s + e.totalPrice, 0),
                  currency,
                )}
              </span>
            </div>
          </Card>
        </Section>
      ))}
    </div>
  );
}
