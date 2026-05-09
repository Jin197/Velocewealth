import { AlertTriangle, Info, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MaintenanceAlert } from '@/lib/types';
import { cn, formatDistance } from '@/lib/utils';

const severityMap = {
  info: {
    Icon: Info,
    color: 'text-veloce',
    bg: 'bg-veloce/10',
    border: 'border-veloce/20',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  critical: {
    Icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
};

const labels: Record<string, string> = {
  tires: 'Pneumatiques',
  brakes: 'Freinage',
  oil: 'Vidange',
  filter: 'Filtres',
  battery: 'Batterie',
  inspection: 'Contrôle',
};

export function AlertCard({ alert }: { alert: MaintenanceAlert }) {
  const { Icon, color, bg, border } = severityMap[alert.severity];
  return (
    <Card className={cn('p-4 border', border)}>
      <div className="flex items-start gap-3">
        <div className={cn('rounded-btn p-2', bg, color)}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className={cn('font-medium uppercase tracking-wider', color)}>
              {labels[alert.category]}
            </span>
            {alert.remainingKm !== undefined && alert.remainingKm > 0 && (
              <span className="text-muted-foreground">
                · dans {formatDistance(alert.remainingKm)}
              </span>
            )}
            {alert.remainingKm === 0 && (
              <span className="text-destructive font-medium">· dépassé</span>
            )}
          </div>
          <div className="text-sm mt-1">{alert.message}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </Card>
  );
}
