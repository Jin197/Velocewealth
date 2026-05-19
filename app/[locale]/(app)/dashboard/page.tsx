import { Link } from '@/lib/i18n/routing';
import {
  Gauge,
  Wallet,
  Activity,
  Leaf,
  Plus,
  ArrowRight,
  Car,
  MapPin,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { StationsMap } from '@/components/domain/stations-map';
import { KpiCard } from '@/components/domain/kpi-card';
import { VehicleCard } from '@/components/domain/vehicle-card';
import { AlertCard } from '@/components/domain/alert-card';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { SpendChart } from '@/components/domain/spend-chart';
import { EnergyMix } from '@/components/domain/energy-mix';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardData, getStations, getGarages } from '@/lib/data';
import {
  computeCostPerKm,
  energyMix,
  monthlySpend,
} from '@/lib/computations';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency, formatDistance } from '@/lib/utils';

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const { profile, vehicles, fuel, maintenance, alerts } = await getDashboardData();
  const [stations, garages] = await Promise.all([
    getStations(profile?.country),
    getGarages(profile?.country)
  ]);

  if (!profile || vehicles.length === 0) {
    return <EmptyState name={profile?.fullName} />;
  }

  const breakdowns = vehicles.map((v) =>
    computeCostPerKm(v, fuel, maintenance, 6),
  );
  const totalSpend = breakdowns.reduce((s, b) => s + b.total, 0);
  const totalDistance = breakdowns.reduce((s, b) => s + b.distance, 0);
  const fleetCostPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;
  const mix = energyMix(fuel);
  const monthly = monthlySpend(fuel, maintenance, 6);
  const recentFuel = fuel.slice(0, 4);
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'warning',
  );

  return (
    <div className="container py-6 lg:py-8 space-y-8">
      <PageHeader
        title={`Bonjour, ${profile.fullName.split(' ')[0]}`}
        description="Voici la photo de votre flotte sur les 6 derniers mois."
        action={
          <Button asChild>
            <Link href="/fuel/scan">
              <Plus className="h-4 w-4" /> Ajouter une dépense
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Coût au km"
          value={fleetCostPerKm.toFixed(3)}
          unit={`${profile.currency}/km`}
          icon={<Gauge className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Dépenses 6 mois"
          value={totalSpend.toFixed(0)}
          unit={profile.currency}
          icon={<Wallet className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Distance"
          value={formatDistance(totalDistance).replace(' km', '')}
          unit="km"
          icon={<Activity className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Score éco"
          value="82"
          unit="/100"
          variant="premium"
          icon={<Leaf className="h-4 w-4" strokeWidth={1.5} />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold">
                Dépenses mensuelles
              </h2>
              <p className="text-xs text-muted-foreground">
                Énergie + entretien sur 6 mois
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-veloce" /> Énergie
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-eco" /> Entretien
              </span>
            </div>
          </div>
          <SpendChart data={monthly} currency={profile.currency} />
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold">
              Mix énergétique
            </h2>
            <p className="text-xs text-muted-foreground">
              Part électrique vs thermique
            </p>
          </div>
          <EnergyMix thermal={mix.thermal} electric={mix.electric} />
          {mix.thermalAmount > 0 && (
            <div className="mt-6 rounded-btn bg-eco/5 border border-eco/10 p-3">
              <div className="text-xs text-eco font-medium">
                Économies cumulées électrique
              </div>
              <div className="font-mono text-lg font-semibold mt-1 tabular-nums">
                {formatCurrency(mix.thermalAmount * 0.3, profile.currency)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                vs 100 % thermique
              </div>
            </div>
          )}
        </Card>
      </div>

      {(criticalAlerts.length > 0 || recentFuel.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {criticalAlerts.length > 0 && (
            <Section
              title="Alertes maintenance"
              description="Anticipez l'usure réelle de chaque véhicule"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/maintenance">
                    Tout voir <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
            >
              <div className="space-y-2">
                {criticalAlerts.map((a) => (
                  <AlertCard key={a.id} alert={a} />
                ))}
              </div>
            </Section>
          )}

          {recentFuel.length > 0 && (
            <Section
              title="Dernières dépenses énergie"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/fuel">
                    Tout voir <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
            >
              <Card className="divide-y divide-border">
                {recentFuel.map((e) => (
                  <FuelEntryRow key={e.id} entry={e} />
                ))}
              </Card>
            </Section>
          )}
        </div>
      )}

      {/* Carte du Réseau à Proximité */}
      <Section
        title="Réseau VeloceWealth"
        description="Stations et garages partenaires à proximité"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/map">
              Voir la carte complète <ArrowRight className="h-3 w-3 ml-1.5" />
            </Link>
          </Button>
        }
      >
        <StationsMap stations={stations} garages={garages} />
      </Section>

      <Section
        title="Vos véhicules"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/vehicles/new">
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </Link>
          </Button>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="container py-12">
      <Card className="p-10 max-w-2xl mx-auto text-center">
        <h1 className="font-display text-2xl font-bold">
          Backend non configuré
        </h1>
        <p className="text-muted-foreground mt-2">
          Renseignez vos clés Supabase dans <code className="font-mono">.env.local</code>
          {' '}puis redémarrez. Voir <code className="font-mono">ONBOARDING.md</code>.
        </p>
      </Card>
    </div>
  );
}

function EmptyState({ name }: { name?: string }) {
  return (
    <div className="container py-12">
      <Card variant="premium" className="p-10 max-w-2xl mx-auto text-center">
        <div className="rounded-full bg-veloce/10 text-veloce h-16 w-16 mx-auto flex items-center justify-center">
          <Car className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-bold mt-6">
          Bienvenue{name ? `, ${name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Pour commencer, ajoutez votre premier véhicule. Velocewealth calculera
          automatiquement votre coût au kilomètre dès la première dépense.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/vehicles/new">
            <Plus className="h-4 w-4" /> Ajouter mon premier véhicule
          </Link>
        </Button>
      </Card>
    </div>
  );
}
