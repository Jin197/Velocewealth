'use client';

import { Link } from '@/lib/i18n/routing';
import {
  Activity,
  Brain,
  Eye,
  Fuel,
  Receipt,
  ShieldAlert,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { KpiCard } from '@/components/domain/kpi-card';
import { AlertCard } from '@/components/domain/alert-card';
import { FuelEntryRow } from '@/components/domain/fuel-entry-row';
import { FineTrackerPanel } from '@/components/domain/fine-tracker-panel';
import { formatCurrency, formatDistance, formatDate } from '@/lib/utils';
import type {
  Vehicle,
  FuelEntry,
  MaintenanceEntry,
  MaintenanceAlert,
  TrafficFine,
  InsuranceRecord,
} from '@/lib/types';
import type { CostBreakdown } from '@/lib/computations';

interface Props {
  vehicle: Vehicle;
  fuel: FuelEntry[];
  maintenance: MaintenanceEntry[];
  alerts: MaintenanceAlert[];
  fines: TrafficFine[];
  insuranceRecords: InsuranceRecord[];
  cost: CostBreakdown;
  tireWear: number;
  brakeWear: number;
  lastTireServiceAt: string | null;
  lastBrakeServiceAt: string | null;
}

export function VehicleTabs({
  vehicle,
  fuel,
  maintenance,
  alerts,
  fines,
  insuranceRecords,
  cost,
  tireWear,
  brakeWear,
  lastTireServiceAt,
  lastBrakeServiceAt,
}: Props) {
  const openFinesCount = fines.filter(
    (f) => f.status === 'unpaid' || f.status === 'contested',
  ).length;
  const insuranceMonthlyAvg =
    vehicle.insuranceMode === 'variable' && insuranceRecords.length > 0
      ? Math.round(
          insuranceRecords.reduce((s, r) => s + r.amount, 0) /
            insuranceRecords.length,
        )
      : vehicle.insuranceMonthly ?? null;

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview" icon={<Eye className="h-4 w-4" />}>
          Aperçu
        </TabsTrigger>
        <TabsTrigger
          value="energy"
          icon={<Fuel className="h-4 w-4" />}
          accent="eco"
        >
          Énergie
        </TabsTrigger>
        <TabsTrigger
          value="maintenance"
          icon={<Wrench className="h-4 w-4" />}
          accent="amber"
          badge={
            alerts.length > 0 ? (
              <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                {alerts.length}
              </Badge>
            ) : undefined
          }
        >
          Maintenance
        </TabsTrigger>
        <TabsTrigger
          value="costs"
          icon={<Wallet className="h-4 w-4" />}
          accent="gold"
        >
          Coûts
        </TabsTrigger>
        <TabsTrigger
          value="compliance"
          icon={<ShieldAlert className="h-4 w-4" />}
          accent={openFinesCount > 0 ? 'destructive' : 'veloce'}
          badge={
            openFinesCount > 0 ? (
              <Badge variant="danger" className="text-[9px] px-1.5 py-0">
                {openFinesCount}
              </Badge>
            ) : undefined
          }
        >
          Conformité
        </TabsTrigger>
      </TabsList>

      {/* ── Aperçu ─────────────────────────────────────────────────── */}
      <TabsContent value="overview">
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
              {lastTireServiceAt ? formatDate(lastTireServiceAt) : 'aucune'}
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
              {lastBrakeServiceAt ? formatDate(lastBrakeServiceAt) : 'aucune'}
            </div>
          </div>
        </Card>

        {alerts.length > 0 && (
          <Card className="p-5 border-amber-500/30 bg-amber-500/5 space-y-2">
            <h3 className="text-sm font-semibold text-amber-500">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''} en cours
            </h3>
            <div className="space-y-2">
              {alerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* ── Énergie ────────────────────────────────────────────────── */}
      <TabsContent value="energy">
        <Card className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-sm">Dernières dépenses énergie</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fuel.length === 0
                ? 'Aucun relevé pour ce véhicule.'
                : `${fuel.length} relevés au total`}
            </p>
          </div>
          <Button asChild size="sm" className="bg-eco hover:bg-eco/90 text-white">
            <Link href={`/fuel/scan?vehicle=${vehicle.id}`}>
              <Fuel className="h-4 w-4" />
              Ajouter
            </Link>
          </Button>
        </Card>
        <Card className="divide-y divide-border">
          {fuel.slice(0, 10).map((e) => (
            <FuelEntryRow key={e.id} entry={e} />
          ))}
          {fuel.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Scannez un ticket pour démarrer le suivi énergétique de ce
              véhicule.
            </div>
          )}
        </Card>
      </TabsContent>

      {/* ── Maintenance ────────────────────────────────────────────── */}
      <TabsContent value="maintenance">
        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex-col items-start gap-1.5"
          >
            <Link href={`/maintenance/plan/${vehicle.id}`}>
              <div className="flex items-center gap-2 text-amber-500">
                <Brain className="h-4 w-4" />
                <span className="font-semibold">Plan IA</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Recommandations basées sur l'historique
              </span>
            </Link>
          </Button>
          <Button
            asChild
            className="h-auto py-4 bg-veloce text-white hover:bg-veloce/90 flex-col items-start gap-1.5"
          >
            <Link href={`/maintenance/prognostics/${vehicle.id}`}>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="font-semibold">Diagnostic IA</span>
              </div>
              <span className="text-xs text-white/70 text-left">
                Prognostics OBD-II + durée de vie composants
              </span>
            </Link>
          </Button>
        </div>

        <Card className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-sm">Historique d'entretien</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {maintenance.length} intervention{maintenance.length > 1 ? 's' : ''}{' '}
              enregistrée{maintenance.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/maintenance/new?vehicle=${vehicle.id}`}>
              + Nouvelle intervention
            </Link>
          </Button>
        </Card>
        <Card className="divide-y divide-border">
          {maintenance.slice(0, 10).map((m) => (
            <Link
              key={m.id}
              href={`/maintenance/${m.id}`}
              className="p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors"
            >
              <div className="rounded-btn bg-amber-500/15 text-amber-500 p-2.5">
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
              Aucun entretien enregistré.
            </div>
          )}
        </Card>
      </TabsContent>

      {/* ── Coûts ──────────────────────────────────────────────────── */}
      <TabsContent value="costs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Coût total 6 mois"
            value={cost.total.toFixed(0)}
            unit={vehicle.currency}
          />
          <KpiCard
            label="Énergie"
            value={cost.energy.toFixed(0)}
            unit={vehicle.currency}
          />
          <KpiCard
            label="Entretien"
            value={cost.maintenance.toFixed(0)}
            unit={vehicle.currency}
          />
          <KpiCard
            label="Assurance"
            value={cost.insurance.toFixed(0)}
            unit={vehicle.currency}
          />
        </div>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">Assurance</h3>
            <Badge
              variant={
                vehicle.insuranceMode === 'variable' ? 'warning' : 'outline'
              }
            >
              {vehicle.insuranceMode === 'variable' ? 'Variable' : 'Fixe'}
            </Badge>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {vehicle.insuranceProvider && (
              <div>
                <dt className="text-xs text-muted-foreground">Assureur</dt>
                <dd className="font-medium">{vehicle.insuranceProvider}</dd>
              </div>
            )}
            {insuranceMonthlyAvg != null && (
              <div>
                <dt className="text-xs text-muted-foreground">
                  {vehicle.insuranceMode === 'variable'
                    ? 'Moyenne mensuelle'
                    : 'Cotisation mensuelle'}
                </dt>
                <dd className="font-mono tabular-nums">
                  {formatCurrency(insuranceMonthlyAvg, vehicle.currency)}
                </dd>
              </div>
            )}
            {vehicle.insuranceMode === 'variable' && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Mois renseignés
                </dt>
                <dd className="font-medium">
                  {insuranceRecords.length}{' '}
                  {insuranceRecords.length > 1 ? 'cotisations' : 'cotisation'}
                </dd>
              </div>
            )}
          </dl>
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              Gérer les cotisations
            </Link>
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-semibold text-sm">Valeur du véhicule</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Prix d'achat</dt>
              <dd className="font-mono tabular-nums">
                {formatCurrency(vehicle.purchasePrice, vehicle.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Valeur estimée</dt>
              <dd className="font-mono tabular-nums">
                {formatCurrency(
                  vehicle.estimatedResaleValue,
                  vehicle.currency,
                )}
              </dd>
            </div>
            {vehicle.purchasePrice > 0 && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Décote</dt>
                <dd className="font-mono tabular-nums text-destructive">
                  −
                  {formatCurrency(
                    vehicle.purchasePrice - vehicle.estimatedResaleValue,
                    vehicle.currency,
                  )}{' '}
                  (
                  {Math.round(
                    ((vehicle.purchasePrice - vehicle.estimatedResaleValue) /
                      vehicle.purchasePrice) *
                      100,
                  )}{' '}
                  %)
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </TabsContent>

      {/* ── Conformité ─────────────────────────────────────────────── */}
      <TabsContent value="compliance">
        <FineTrackerPanel
          vehicleId={vehicle.id}
          fines={fines}
          totalVehicleSpend={cost.total}
          currency={vehicle.currency}
        />
      </TabsContent>
    </Tabs>
  );
}
