'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleTaskModal } from '@/components/domain/schedule-task-modal';
import {
  dismissTaskAction,
  snoozeTaskAction,
  completeTaskAction,
} from '@/server/actions/maintenance-tasks';
import type { MaintenanceTaskRecord } from '@/lib/types';

interface Props {
  task: MaintenanceTaskRecord;
}

export function AgendaActions({ task }: Props) {
  const [pending, startTransition] = useTransition();
  const [openSchedule, setOpenSchedule] = useState(false);

  const handleSnooze = () => {
    const until = new Date();
    until.setDate(until.getDate() + 14);
    const iso = until.toISOString().slice(0, 10);
    startTransition(async () => {
      const res = await snoozeTaskAction({ taskId: task.id, until: iso });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Tâche reportée de 14 jours.');
    });
  };

  const handleDismiss = () => {
    startTransition(async () => {
      const res = await dismissTaskAction({ taskId: task.id });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Tâche ignorée.');
    });
  };

  const handleComplete = () => {
    const mileageStr = window.prompt(
      `Kilométrage au moment de "${task.title}" :`,
      '',
    );
    if (!mileageStr) return;
    const mileage = Number(mileageStr);
    if (!Number.isFinite(mileage) || mileage < 0) {
      toast.error('Kilométrage invalide.');
      return;
    }
    const costStr = window.prompt('Coût payé (€)', '0');
    if (costStr === null) return;
    const cost = Number(costStr);
    if (!Number.isFinite(cost) || cost < 0) {
      toast.error('Coût invalide.');
      return;
    }
    const garage = window.prompt(
      'Garage / atelier (obligatoire)',
      task.garageName || '',
    );
    if (!garage || garage.trim().length === 0) {
      toast.error('Garage requis.');
      return;
    }
    startTransition(async () => {
      const res = await completeTaskAction({
        taskId: task.id,
        mileageKm: mileage,
        cost,
        garageName: garage.trim(),
        description: task.title,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Tâche marquée comme effectuée.');
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {task.status !== 'scheduled' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenSchedule(true)}
          disabled={pending}
          className="h-7 text-xs"
        >
          Planifier
        </Button>
      )}
      {task.status === 'scheduled' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenSchedule(true)}
          disabled={pending}
          className="h-7 text-xs"
        >
          Modifier
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSnooze}
        disabled={pending}
        className="h-7 text-xs gap-1"
      >
        <Clock className="h-3 w-3" />
        Reporter
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleComplete}
        disabled={pending}
        className="h-7 text-xs gap-1"
      >
        <Check className="h-3 w-3" />
        Faite
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDismiss}
        disabled={pending}
        className="h-7 text-xs gap-1 text-muted-foreground"
      >
        <X className="h-3 w-3" />
        Ignorer
      </Button>

      <ScheduleTaskModal
        open={openSchedule}
        task={{
          id: task.id,
          vehicleId: task.vehicleId,
          category: task.category,
          title: task.title,
          description: task.description,
          reasoning: task.reasoning,
          confidence: task.confidence,
          estimatedCost: task.estimatedCost,
          dueAtDate: task.dueAtDate,
          dueAtKm: task.dueAtKm,
          source: task.source,
        }}
        onClose={() => setOpenSchedule(false)}
      />
    </div>
  );
}
