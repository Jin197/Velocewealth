import { Link } from '@/lib/i18n/routing';
import {
  CalendarClock,
  ChevronRight,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { MaintenanceTaskRecord } from '@/lib/types';

interface Props {
  tasks: MaintenanceTaskRecord[];
  /** Optional fleet → readable label lookup (vehicleId → "Peugeot 3008 AA-123-CD"). */
  vehicleLabels?: Record<string, string>;
}

/**
 * Compact dashboard card showing the next few maintenance tasks across the
 * user's whole fleet. Designed to slot below the existing 4-KPI row.
 */
export function UpcomingTasksCard({ tasks, vehicleLabels = {} }: Props) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const scheduled = tasks
    .filter((t) => t.status === 'scheduled' && t.scheduledFor)
    .sort((a, b) =>
      (a.scheduledFor ?? '').localeCompare(b.scheduledFor ?? ''),
    );
  const overdue = scheduled.filter(
    (t) => (t.scheduledFor ?? '') < todayISO,
  );
  const pending = tasks.filter((t) => t.status === 'pending');
  const next = scheduled.slice(0, 4);

  if (tasks.length === 0) {
    return (
      <Card className="p-5 flex items-center gap-4">
        <div className="rounded-btn bg-eco/10 text-eco p-2.5 shrink-0">
          <Wrench className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Maintenance — Agenda
          </div>
          <div className="text-sm font-medium mt-1">
            Aucune tâche programmée. Ouvrez le plan d'un véhicule pour générer
            votre première liste.
          </div>
        </div>
        <Link
          href="/maintenance/agenda"
          className="text-xs text-veloce hover:underline flex items-center gap-1 shrink-0"
        >
          Agenda
          <ChevronRight className="h-3 w-3" />
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5 text-veloce" />
          Maintenance — Agenda
        </div>
        <Link
          href="/maintenance/agenda"
          className="text-xs text-veloce hover:underline flex items-center gap-1"
        >
          Voir tout
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Metric label="Planifiées" value={scheduled.length} />
        <Metric label="À planifier" value={pending.length} />
        <Metric
          label="En retard"
          value={overdue.length}
          tone={overdue.length > 0 ? 'danger' : 'default'}
        />
      </div>

      {next.length > 0 && (
        <div className="space-y-2">
          {next.map((task) => {
            const isOverdue =
              !!task.scheduledFor && task.scheduledFor < todayISO;
            return (
              <div
                key={task.id}
                className={
                  'flex items-center gap-3 py-2 px-3 rounded-card border transition-colors ' +
                  (isOverdue
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border/40 bg-muted/20 hover:bg-muted/40')
                }
              >
                <div
                  className={
                    'rounded-btn p-1.5 shrink-0 ' +
                    (isOverdue
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-veloce/10 text-veloce')
                  }
                >
                  {isOverdue ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {vehicleLabels[task.vehicleId] ?? 'Véhicule'}
                    {task.garageName ? ` · ${task.garageName}` : ''}
                  </div>
                </div>
                <Badge
                  variant={isOverdue ? 'danger' : 'outline'}
                  className="font-mono text-[10px] shrink-0"
                >
                  {task.scheduledFor ? formatDate(task.scheduledFor) : '—'}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'danger';
}) {
  const color = tone === 'danger' ? 'text-destructive' : 'text-foreground';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`font-mono font-semibold text-xl tabular-nums mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}
