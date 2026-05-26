import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import {
  CalendarClock,
  CheckCheck,
  ChevronLeft,
  Clock,
  MapPin,
  Wrench,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/domain/page-header';
import { KpiCard } from '@/components/domain/kpi-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/env';
import { getAllUserTasks } from '@/server/actions/maintenance-tasks';
import { getDashboardData } from '@/lib/data';
import { formatDate, formatCurrency } from '@/lib/utils';
import { AgendaActions } from './agenda-actions';
import type { MaintenanceTaskRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MaintenanceAgendaPage() {
  if (!isSupabaseConfigured()) notFound();
  const [tasks, { vehicles }] = await Promise.all([
    getAllUserTasks(),
    getDashboardData(),
  ]);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const todayISO = new Date().toISOString().slice(0, 10);
  const buckets = bucketByTime(tasks, todayISO);
  const scheduledCount = tasks.filter((t) => t.status === 'scheduled').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const overdueCount = buckets.overdue.length;
  const nextScheduled = tasks
    .filter((t) => t.status === 'scheduled' && t.scheduledFor)
    .sort((a, b) =>
      (a.scheduledFor ?? '').localeCompare(b.scheduledFor ?? ''),
    )[0];

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/dashboard">
          <ChevronLeft className="h-4 w-4" /> Retour au dashboard
        </Link>
      </Button>

      <PageHeader
        title="Agenda maintenance"
        description="Toutes les tâches programmées de votre flotte, en un seul endroit."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="À planifier"
          value={String(pendingCount)}
          icon={<Clock className="h-4 w-4" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Planifiées"
          value={String(scheduledCount)}
          icon={<CalendarClock className="h-4 w-4" strokeWidth={1.5} />}
          variant={scheduledCount > 0 ? 'glass' : 'default'}
        />
        <KpiCard
          label="En retard"
          value={String(overdueCount)}
          icon={<Wrench className="h-4 w-4" strokeWidth={1.5} />}
          variant={overdueCount > 0 ? 'premium' : 'default'}
        />
        <KpiCard
          label="Prochaine"
          value={nextScheduled?.scheduledFor ? formatDate(nextScheduled.scheduledFor) : '—'}
          hint={nextScheduled?.title}
        />
      </div>

      <TasksGroup
        title="En retard"
        emoji="⚠"
        tone="danger"
        tasks={buckets.overdue}
        vehicleMap={vehicleMap}
      />
      <TasksGroup
        title="Aujourd'hui & cette semaine"
        emoji="📅"
        tone="warning"
        tasks={buckets.week}
        vehicleMap={vehicleMap}
      />
      <TasksGroup
        title="Plus tard"
        emoji="🗓"
        tone="default"
        tasks={buckets.later}
        vehicleMap={vehicleMap}
      />
      <TasksGroup
        title="Non planifiées"
        emoji="✎"
        tone="muted"
        tasks={buckets.unscheduled}
        vehicleMap={vehicleMap}
      />

      {tasks.length === 0 && (
        <Card className="p-10 text-center">
          <CheckCheck className="h-8 w-8 text-eco mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-semibold">
            Aucune tâche en attente
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Générez un plan de maintenance sur la page d'un véhicule pour faire
            apparaître vos premières tâches ici.
          </p>
        </Card>
      )}
    </div>
  );
}

function TasksGroup({
  title,
  emoji,
  tone,
  tasks,
  vehicleMap,
}: {
  title: string;
  emoji: string;
  tone: 'danger' | 'warning' | 'default' | 'muted';
  tasks: MaintenanceTaskRecord[];
  vehicleMap: Map<string, { id: string; make: string; model: string; plate: string; currency: string }>;
}) {
  if (tasks.length === 0) return null;
  return (
    <Section
      title={`${emoji}  ${title}`}
      action={<Badge variant="muted">{tasks.length}</Badge>}
    >
      <div className="space-y-3">
        {tasks.map((task) => {
          const vehicle = vehicleMap.get(task.vehicleId);
          return (
            <Card
              key={task.id}
              className={
                tone === 'danger'
                  ? 'p-4 border-destructive/40 bg-destructive/5'
                  : tone === 'warning'
                    ? 'p-4 border-amber-500/30'
                    : tone === 'muted'
                      ? 'p-4 opacity-90'
                      : 'p-4'
              }
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {sourceLabel(task.source)}
                    </Badge>
                    {task.status === 'snoozed' && (
                      <Badge variant="muted" className="text-[10px]">
                        Reporté
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vehicle
                      ? `${vehicle.make} ${vehicle.model} · ${vehicle.plate}`
                      : 'Véhicule inconnu'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                    {task.scheduledFor && (
                      <span className="flex items-center gap-1 font-mono">
                        <CalendarClock className="h-3 w-3" />
                        {formatDate(task.scheduledFor)}
                      </span>
                    )}
                    {task.garageName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.garageName}
                      </span>
                    )}
                    {task.estimatedCost != null && (
                      <span className="font-mono">
                        {formatCurrency(
                          task.estimatedCost,
                          (vehicle?.currency ?? 'EUR') as 'EUR',
                        )}
                      </span>
                    )}
                  </div>
                  {task.notes && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                      {task.notes}
                    </p>
                  )}
                </div>
                <AgendaActions task={task} />
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

function bucketByTime(
  tasks: MaintenanceTaskRecord[],
  todayISO: string,
): {
  overdue: MaintenanceTaskRecord[];
  week: MaintenanceTaskRecord[];
  later: MaintenanceTaskRecord[];
  unscheduled: MaintenanceTaskRecord[];
} {
  const today = new Date(todayISO);
  const in7days = new Date(today);
  in7days.setDate(in7days.getDate() + 7);

  const overdue: MaintenanceTaskRecord[] = [];
  const week: MaintenanceTaskRecord[] = [];
  const later: MaintenanceTaskRecord[] = [];
  const unscheduled: MaintenanceTaskRecord[] = [];

  for (const t of tasks) {
    if (!t.scheduledFor) {
      unscheduled.push(t);
      continue;
    }
    const d = new Date(t.scheduledFor);
    if (d < today) overdue.push(t);
    else if (d <= in7days) week.push(t);
    else later.push(t);
  }
  return { overdue, week, later, unscheduled };
}

function sourceLabel(source: string): string {
  switch (source) {
    case 'plan':
      return 'IA';
    case 'phm':
      return 'PHM';
    case 'manual':
      return 'Manuel';
    default:
      return source;
  }
}
