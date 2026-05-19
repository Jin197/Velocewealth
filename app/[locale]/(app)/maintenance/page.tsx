import { Link } from '@/lib/i18n/routing';
import { Plus, Wrench, FileText, Brain } from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { AlertCard } from '@/components/domain/alert-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getMaintenanceEntries,
  getActiveAlerts,
  getVehicles,
} from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency, formatDate, formatDistance } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const categoryLabels: Record<string, string> = {
  oil: 'Vidange',
  tires: 'Pneumatiques',
  brakes: 'Freinage',
  filter: 'Filtres',
  battery: 'Batterie',
  inspection: 'Contrôle',
  other: 'Autre',
};

export default async function MaintenancePage() {
  if (!isSupabaseConfigured()) {
    return <Empty />;
  }

  const [maintenance, alerts, vehicles] = await Promise.all([
    getMaintenanceEntries(),
    getActiveAlerts(),
    getVehicles(),
  ]);

  if (maintenance.length === 0 && alerts.length === 0) {
    return <Empty firstVehicleId={vehicles[0]?.id} />;
  }

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Entretien"
        description="Historique, alertes et carnet certifié de votre flotte"
        action={
          <div className="flex gap-2 flex-wrap">
            {vehicles[0] && (
              <Button variant="outline" asChild>
                <Link href={`/maintenance/plan/${vehicles[0].id}`}>
                  <Brain className="h-4 w-4" /> Plan IA
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/maintenance/log">
                <FileText className="h-4 w-4" /> Carnet certifié
              </Link>
            </Button>
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4" /> Ajouter
              </Link>
            </Button>
          </div>
        }
      />

      {vehicles.length > 1 && (
        <Section
          title="Plan de maintenance par véhicule"
          description="Générique ou jumeau numérique selon l'historique"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.map((v) => {
              const count = maintenance.filter((m) => m.vehicleId === v.id).length;
              return (
                <Link
                  key={v.id}
                  href={`/maintenance/plan/${v.id}`}
                  className="rounded-card border border-border bg-card p-4 hover:bg-muted/40 transition-colors flex items-center gap-3"
                >
                  <div className="rounded-btn bg-veloce/10 text-veloce p-2">
                    <Brain className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {v.make} {v.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {count > 0
                        ? `Jumeau numérique · ${count} historique${count > 1 ? 's' : ''}`
                        : 'Plan générique'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {alerts.length > 0 && (
        <Section
          title="Alertes prédictives"
          description="Calculées par algorithme à partir de l'usure réelle"
        >
          <div className="grid sm:grid-cols-2 gap-2">
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </Section>
      )}

      {maintenance.length > 0 && (
        <Section title="Historique" description="Toutes les interventions, par date">
          <Card className="divide-y divide-border">
            {maintenance.map((m) => {
              const v = vehicles.find((veh) => veh.id === m.vehicleId);
              return (
                <Link
                  key={m.id}
                  href={`/maintenance/${m.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="rounded-btn bg-veloce/10 text-veloce p-2.5 shrink-0">
                    <Wrench className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {m.description}
                      <Badge
                        variant="muted"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {categoryLabels[m.category]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {v && (
                        <span>
                          {v.make} {v.model}
                        </span>
                      )}
                      <span>· {m.garageName}</span>
                      <span>· {formatDate(m.occurredAt)}</span>
                      <span>· {formatDistance(m.mileageKm)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold tabular-nums">
                      {formatCurrency(m.cost, m.currency)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </Card>
        </Section>
      )}
    </div>
  );
}

function Empty({ firstVehicleId }: { firstVehicleId?: string }) {
  return (
    <div className="container py-12">
      <Card className="p-10 max-w-xl mx-auto text-center">
        <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
          <Wrench className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-xl font-bold mt-5">
          Aucun entretien enregistré
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Générez un plan d'entretien basé sur les recommandations constructeur,
          ou saisissez vos premières interventions pour activer le jumeau
          numérique.
        </p>
        <div className="mt-5 flex gap-2 justify-center flex-wrap">
          {firstVehicleId && (
            <Button variant="outline" asChild>
              <Link href={`/maintenance/plan/${firstVehicleId}`}>
                <Brain className="h-4 w-4" /> Générer un plan
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/maintenance/new">
              <Plus className="h-4 w-4" /> Ajouter une intervention
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
