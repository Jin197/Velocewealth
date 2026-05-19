import { Link } from '@/lib/i18n/routing';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Fuel,
  Wrench,
  TrendingUp,
  Gauge,
  Calendar,
  Hash,
  Brain,
  Activity
} from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { KpiCard } from '@/components/domain/kpi-card';
import { AlertCard } from '@/components/domain/alert-card';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DeleteVehicleButton } from './delete-vehicle-button';
import {
  getVehicle,
  getFuelEntries,
  getMaintenanceEntries,
  getActiveAlerts,
} from '@/lib/data';
import { computeCostPerKm, tireWearPercent } from '@/lib/computations';
import { formatCurrency, formatDistance, formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) return notFound();

  const [vehicle, fuel, maintenance, alerts] = await Promise.all([
    getVehicle(params.id),
    getFuelEntries(params.id),
    getMaintenanceEntries(params.id),
    getActiveAlerts(),
  ]);
  if (!vehicle) return notFound();

  const cost = computeCostPerKm(vehicle, fuel, maintenance, 6);
  const lastTireService = maintenance.find((m) => m.category === 'tires');
  const tireWear = lastTireService
    ? tireWearPercent(
        vehicle.currentMileageKm,
        lastTireService.mileageKm,
        lastTireService.nextDueMileage,
      )
    : 0;
  const lastBrakeService = maintenance.find((m) => m.category === 'brakes');
  const brakeWear = lastBrakeService
    ? tireWearPercent(
        vehicle.currentMileageKm,
        lastBrakeService.mileageKm,
        lastBrakeService.nextDueMileage,
      )
    : 25;
  const myAlerts = alerts.filter((a) => a.vehicleId === vehicle.id);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-7xl mx-auto w-full">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/vehicles">
          <ChevronLeft className="h-4 w-4" /> Tous les véhicules
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/3] md:aspect-auto bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{vehicle.year}</Badge>
                <Badge variant="outline">
                  {vehicle.fuelType === 'electric'
                    ? 'Électrique'
                    : vehicle.fuelType === 'hybrid'
                      ? 'Hybride'
                      : 'Thermique'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/maintenance/plan/${vehicle.id}`}>
                    <Brain className="h-4 w-4" /> Plan IA
                  </Link>
                </Button>
                <Button size="sm" className="bg-veloce text-white hover:bg-veloce/90" asChild>
                  <Link href={`/maintenance/prognostics/${vehicle.id}`}>
                    <Activity className="h-4 w-4" /> Diagnostic IA
                  </Link>
                </Button>
                <DeleteVehicleButton
                  id={vehicle.id}
                  label={`${vehicle.make} ${vehicle.model}`}
                />
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              {(vehicle.trim || vehicle.color) && (
                <div className="text-sm text-muted-foreground">
                  {vehicle.trim || ''}
                  {vehicle.color ? ` · ${vehicle.color}` : ''}
                </div>
              )}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Immatriculation
                </dt>
                <dd className="font-mono font-medium mt-1">{vehicle.plate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Gauge className="h-3 w-3" /> Kilométrage
                </dt>
                <dd className="font-mono font-medium mt-1 tabular-nums">
                  {formatDistance(vehicle.currentMileageKm)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Acquis le
                </dt>
                <dd className="font-medium mt-1">
                  {formatDate(vehicle.purchaseDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" /> Valeur estimée
                </dt>
                <dd className="font-mono font-medium mt-1 tabular-nums">
                  {formatCurrency(
                    vehicle.estimatedResaleValue,
                    vehicle.currency,
                  )}
                </dd>
              </div>
            </dl>

            {vehicle.purchasePrice > 0 && (
              <div className="mt-6 rounded-card bg-muted/40 p-4 text-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Décote depuis l'achat
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-semibold tabular-nums text-destructive">
                    −
                    {formatCurrency(
                      vehicle.purchasePrice - vehicle.estimatedResaleValue,
                      vehicle.currency,
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {Math.round(
                      ((vehicle.purchasePrice - vehicle.estimatedResaleValue) /
                        vehicle.purchasePrice) *
                        100,
                    )}{' '}
                    %)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Coût au km"
          value={cost.costPerKm.toFixed(3)}
          unit={`${vehicle.currency}/km`}
        />
        <KpiCard
          label="Énergie 6 mois"
          value={cost.energy.toFixed(0)}
          unit={vehicle.currency}
        />
        <KpiCard
          label="Entretien 6 mois"
          value={cost.maintenance.toFixed(0)}
          unit={vehicle.currency}
        />
        <KpiCard
          label="Distance 6 mois"
          value={formatDistance(cost.distance).replace(' km', '')}
          unit="km"
        />
      </div>

      <Section
        title="Digital Twin · usure prédite"
        description="Calculée à partir du kilométrage et de l'historique d'entretien"
      >
        <Card className="p-6 grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Pneumatiques</span>
              <span className="font-mono tabular-nums">{tireWear}%</span>
            </div>
            <Progress
              value={tireWear}
              variant={
                tireWear >= 80 ? 'danger' : tireWear >= 60 ? 'warning' : 'eco'
              }
              className="mt-2 h-2"
            />
            <div className="text-xs text-muted-foreground mt-1.5">
              Dernière intervention :{' '}
              {lastTireService
                ? formatDate(lastTireService.occurredAt)
                : 'aucune'}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Freinage</span>
              <span className="font-mono tabular-nums">{brakeWear}%</span>
            </div>
            <Progress
              value={brakeWear}
              variant={
                brakeWear >= 80 ? 'danger' : brakeWear >= 60 ? 'warning' : 'eco'
              }
              className="mt-2 h-2"
            />
            <div className="text-xs text-muted-foreground mt-1.5">
              Dernière intervention :{' '}
              {lastBrakeService
                ? formatDate(lastBrakeService.occurredAt)
                : 'aucune'}
            </div>
          </div>
        </Card>
      </Section>

      {myAlerts.length > 0 && (
        <Section title="Alertes en cours">
          <div className="space-y-2">
            {myAlerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Dernières dépenses énergie"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/fuel">Tout voir</Link>
          </Button>
        }
      >
        <Card className="divide-y divide-border">
          {fuel.slice(0, 5).map((e) => (
            <FuelEntryRow key={e.id} entry={e} />
          ))}
          {fuel.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune dépense pour ce véhicule.
              <div className="mt-3">
                <Button size="sm" asChild>
                  <Link href={`/fuel/scan?vehicle=${vehicle.id}`}>
                    <Fuel className="h-4 w-4" /> Ajouter une dépense
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Section>

      <Section
        title="Historique d'entretien"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/maintenance/new?vehicle=${vehicle.id}`}>
              + Nouvelle intervention
            </Link>
          </Button>
        }
      >
        <Card className="divide-y divide-border">
          {maintenance.slice(0, 5).map((m) => (
            <Link
              key={m.id}
              href={`/maintenance/${m.id}`}
              className="p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors"
            >
              <div className="rounded-btn bg-veloce/10 text-veloce p-2.5">
                <Wrench className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {m.description}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {m.garageName} · {formatDate(m.occurredAt)} ·{' '}
                  {formatDistance(m.mileageKm)}
                </div>
              </div>
              <div className="font-mono font-semibold tabular-nums">
                {formatCurrency(m.cost, m.currency)}
              </div>
            </Link>
          ))}
          {maintenance.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucun entretien enregistré pour ce véhicule.
            </div>
          )}
        </Card>
      </Section>
    </div>
  );
}
