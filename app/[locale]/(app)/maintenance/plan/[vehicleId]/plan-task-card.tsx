'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Calendar,
  CalendarPlus,
  Gauge,
  Wrench,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDistance, formatDate } from '@/lib/utils';
import type { MaintenanceTask } from '@/lib/maintenance/plan';
import { ScheduleTaskModal } from '@/components/domain/schedule-task-modal';
import type { MaintenanceCategory } from '@/lib/types';

interface Props {
  task: MaintenanceTask;
  vehicleId: string;
  vehicleCurrency: string;
}

export function PlanTaskCard({ task, vehicleId, vehicleCurrency }: Props) {
  const [open, setOpen] = useState(false);
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
    <>
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

        <div className="mt-3 pt-3 border-t border-border flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-7 text-xs gap-1.5"
          >
            <CalendarPlus className="h-3 w-3" />
            Planifier
          </Button>
        </div>
      </Card>

      <ScheduleTaskModal
        open={open}
        onClose={() => setOpen(false)}
        task={{
          vehicleId,
          category: task.category as MaintenanceCategory,
          title: task.title,
          description: task.description,
          reasoning: task.reasoning,
          confidence: task.confidence,
          estimatedCost: task.estimatedCost,
          dueAtDate: task.dueAtDate,
          dueAtKm: task.dueAtKm,
          source: task.source === 'digital-twin' || task.source === 'hybrid' ? 'plan' : 'plan',
        }}
      />
    </>
  );
}
