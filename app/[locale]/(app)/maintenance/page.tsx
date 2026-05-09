import { Link } from '@/lib/i18n/routing';
import { Plus, Wrench, FileText } from 'lucide-react';
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
    return <Empty />;
  }

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Entretien"
        description="Historique, alertes et carnet certifié de votre flotte"
        action={
          <div className="flex gap-2">
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

function Empty() {
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
          Chaque intervention sera signée et ajoutée au carnet certifié.
        </p>
        <Button asChild className="mt-5">
          <Link href="/maintenance/new">
            <Plus className="h-4 w-4" /> Ajouter une intervention
          </Link>
        </Button>
      </Card>
    </div>
  );
}
