import { Link } from '@/lib/i18n/routing';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Gauge,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Brain,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { KpiCard } from '@/components/domain/kpi-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  getVehicle,
  getMaintenanceEntries,
  getFuelEntries,
} from '@/lib/data';
import {
  generateMaintenancePlan,
  type MaintenanceTask,
  type PlanSource,
} from '@/lib/maintenance/plan';
import { formatCurrency, formatDistance, formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function MaintenancePlanPage({
  params,
}: {
  params: Promise<{ vehicleId: string; locale: string }>;
}) {
  const { vehicleId } = await params;
  if (!isSupabaseConfigured()) notFound();

  const vehicle = await getVehicle(vehicleId);
  if (!vehicle) notFound();

  const [history, fuel] = await Promise.all([
    getMaintenanceEntries(vehicleId),
    getFuelEntries(vehicleId),
  ]);

  const plan = generateMaintenancePlan(vehicle, history, fuel);

  const overdue = plan.tasks.filter((t) => t.severity === 'critical');
  const upcoming = plan.tasks.filter((t) => t.severity === 'warning');
  const planned = plan.tasks.filter((t) => t.severity === 'info');

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Plan de maintenance"
        description={`${vehicle.make} ${vehicle.model} · ${vehicle.year} · ${formatDistance(vehicle.currentMileageKm)}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/vehicles/${vehicleId}`}>Retour véhicule</Link>
            </Button>
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4" /> Saisir une intervention
              </Link>
            </Button>
          </div>
        }
      />

      <SourceBanner
        source={plan.source}
        confidence={plan.globalConfidence}
        historyCount={history.length}
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <KpiCard
          label="Kilométrage annuel estimé"
          value={`${Math.round(plan.annualMileageKm / 1000)}k km/an`}
          hint={fuel.length >= 2 ? 'Calculé sur 12 mois' : 'Estimation par défaut'}
          icon={<Gauge className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Budget entretien 12 mois"
          value={formatCurrency(plan.budget12mo, vehicle.currency)}
          hint={`${plan.tasks.filter((t) => new Date(t.dueAtDate).getTime() < Date.now() + 365 * 86400000).length} interventions prévues`}
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Confiance du modèle"
          value={`${Math.round(plan.globalConfidence * 100)}%`}
          hint={
            plan.source === 'digital-twin'
              ? 'Adapté à votre conduite'
              : plan.source === 'hybrid'
                ? 'Mix historique + constructeur'
                : 'Recommandations constructeur'
          }
          icon={
            plan.source === 'digital-twin' ? (
              <Brain className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <BookOpen className="h-4 w-4" strokeWidth={1.5} />
            )
          }
        />
      </div>

      {overdue.length > 0 && (
        <Section
          title={`En retard (${overdue.length})`}
          description="À traiter sans délai — risque sécurité"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {overdue.map((t) => (
              <TaskCard key={t.category} task={t} vehicleCurrency={vehicle.currency} />
            ))}
          </div>
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section
          title={`À venir (${upcoming.length})`}
          description="Dans les 90 prochains jours ou 3 000 km"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {upcoming.map((t) => (
              <TaskCard key={t.category} task={t} vehicleCurrency={vehicle.currency} />
            ))}
          </div>
        </Section>
      )}

      {planned.length > 0 && (
        <Section
          title={`Planifié (${planned.length})`}
          description="Intervalle long — surveillance"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {planned.map((t) => (
              <TaskCard key={t.category} task={t} vehicleCurrency={vehicle.currency} />
            ))}
          </div>
        </Section>
      )}

      {plan.tasks.length === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-eco mx-auto" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-semibold mt-3">
            Rien à signaler
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aucune intervention recommandée pour ce profil.
          </p>
        </Card>
      )}
    </div>
  );
}

function SourceBanner({
  source,
  confidence,
  historyCount,
}: {
  source: PlanSource;
  confidence: number;
  historyCount: number;
}) {
  if (source === 'digital-twin') {
    return (
      <Card variant="premium" className="p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-btn bg-veloce/15 text-veloce p-2.5 shrink-0">
            <Brain className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-semibold">Jumeau numérique actif</h2>
              <Badge variant="premium" className="text-[10px]">
                <Sparkles className="h-2.5 w-2.5" /> Adaptatif
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Plan personnalisé d'après {historyCount} intervention
              {historyCount > 1 ? 's' : ''} de votre carnet. Les intervalles
              s'adaptent à votre conduite réelle (kilométrage, usure observée,
              coûts moyens).
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={confidence * 100} className="flex-1 h-1.5" />
              <span className="font-mono text-xs tabular-nums">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (source === 'hybrid') {
    return (
      <Card className="p-5 border-veloce/30">
        <div className="flex items-start gap-4">
          <div className="rounded-btn bg-veloce/10 text-veloce p-2.5 shrink-0">
            <Brain className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold">Modèle hybride</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mix de votre historique partiel ({historyCount} intervention
              {historyCount > 1 ? 's' : ''}) et des recommandations
              constructeur. Plus vous saisissez d'entretiens, plus le jumeau
              numérique devient précis.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-btn bg-muted text-muted-foreground p-2.5 shrink-0">
          <BookOpen className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold">Plan générique</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aucun historique pour ce véhicule — le plan est basé sur les
            intervalles constructeur et les standards FFA. Saisissez vos
            premières interventions pour activer le{' '}
            <span className="text-veloce font-medium">jumeau numérique</span> qui
            ajustera les prévisions à votre conduite.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/maintenance/new">
              <Plus className="h-3.5 w-3.5" /> Saisir un entretien passé
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TaskCard({
  task,
  vehicleCurrency,
}: {
  task: MaintenanceTask;
  vehicleCurrency: string;
}) {
  const isOverdue = task.severity === 'critical';
  const Icon =
    task.source === 'digital-twin'
      ? Brain
      : task.source === 'hybrid'
        ? Wrench
        : BookOpen;
  const sourceLabel =
    task.source === 'digital-twin'
      ? 'Jumeau numérique'
      : task.source === 'hybrid'
        ? 'Mixte'
        : 'Constructeur';

  return (
    <Card
      className={
        isOverdue
          ? 'p-4 border-destructive/40 bg-destructive/5'
          : task.severity === 'warning'
            ? 'p-4 border-amber-500/30'
            : 'p-4'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={
              isOverdue
                ? 'rounded-btn bg-destructive/15 text-destructive p-2 shrink-0'
                : task.severity === 'warning'
                  ? 'rounded-btn bg-amber-500/15 text-amber-500 p-2 shrink-0'
                  : 'rounded-btn bg-veloce/10 text-veloce p-2 shrink-0'
            }
          >
            {isOverdue ? (
              <AlertTriangle className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Wrench className="h-4 w-4" strokeWidth={2} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{task.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {task.description}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono font-semibold tabular-nums text-sm">
            {formatCurrency(task.estimatedCost, vehicleCurrency as 'EUR')}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {isOverdue ? (
            <span className="text-destructive font-medium">
              En retard de {Math.abs(task.daysUntilDue)}j
            </span>
          ) : (
            <span>
              {task.daysUntilDue < 90
                ? `Dans ${task.daysUntilDue}j`
                : formatDate(task.dueAtDate)}
            </span>
          )}
        </div>
        {task.dueAtKm !== undefined && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="h-3 w-3" />
            {task.kmUntilDue !== undefined && task.kmUntilDue < 0 ? (
              <span className="text-destructive font-medium">
                {formatDistance(Math.abs(task.kmUntilDue))} dépassé
              </span>
            ) : (
              <span>{formatDistance(task.dueAtKm)}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground min-w-0">
          <Icon className="h-3 w-3 shrink-0" />
          <span className="truncate">{task.reasoning}</span>
        </div>
        <Badge variant="muted" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
          {sourceLabel}
        </Badge>
      </div>
    </Card>
  );
}
