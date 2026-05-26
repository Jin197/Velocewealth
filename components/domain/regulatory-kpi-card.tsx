import { Link } from '@/lib/i18n/routing';
import { AlertTriangle, ChevronRight, Scale, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  calculateFineMetrics,
  DEFAULT_LICENCE_POINTS,
} from '@/lib/computations/fines';
import type { TrafficFine } from '@/lib/types';

interface Props {
  fines: TrafficFine[];
  totalFleetSpend: number;
  currency?: string;
  hrefFirstVehicle?: string | null;
}

/**
 * Compact fleet-level summary of the regulatory impact on the user's TCO.
 * Designed to slot into the dashboard as a single-row card.
 */
export function RegulatoryKpiCard({
  fines,
  totalFleetSpend,
  currency = 'EUR',
  hrefFirstVehicle,
}: Props) {
  const metrics = calculateFineMetrics(fines, totalFleetSpend);
  const nextUrgent = metrics.urgent[0];
  const pointsLow = metrics.pointsLeft <= 4;

  if (fines.length === 0) {
    return (
      <Card className="p-5 flex items-center gap-4">
        <div className="rounded-btn bg-eco/10 text-eco p-2.5 shrink-0">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Indice réglementaire
          </div>
          <div className="text-sm font-medium mt-1">
            Aucune amende enregistrée — votre solde de points est intact (
            {DEFAULT_LICENCE_POINTS}/12).
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-veloce" />
          Indice réglementaire
        </div>
        {hrefFirstVehicle && (
          <Link
            href={hrefFirstVehicle}
            className="text-xs text-veloce hover:underline flex items-center gap-1"
          >
            Voir l'historique
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric
          label="Solde points"
          value={`${metrics.pointsLeft}`}
          suffix="/ 12"
          tone={pointsLow ? 'danger' : 'default'}
        />
        <Metric
          label="Impayé"
          value={formatCurrency(metrics.outstanding.total, currency)}
          suffix={
            metrics.outstanding.count > 0
              ? `· ${metrics.outstanding.count} amende${metrics.outstanding.count > 1 ? 's' : ''}`
              : undefined
          }
          tone={metrics.outstanding.total > 0 ? 'warning' : 'default'}
        />
        <Metric
          label="Impact TCO"
          value={`${metrics.impactRatioPct}`}
          suffix="%"
          tone={metrics.impactRatioPct > 5 ? 'warning' : 'default'}
        />
      </div>

      {nextUrgent && (
        <div className="mt-4 flex items-center gap-2 rounded-card bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong className="font-semibold">Urgent :</strong> une amende
            passe au palier supérieur dans{' '}
            <span className="font-mono font-semibold">
              {nextUrgent.daysLeft}j
            </span>
            .
          </span>
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  suffix,
  tone = 'default',
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: 'default' | 'warning' | 'danger';
}) {
  const valueColor =
    tone === 'danger'
      ? 'text-destructive'
      : tone === 'warning'
        ? 'text-amber-500'
        : 'text-foreground';

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono font-semibold text-xl tabular-nums ${valueColor}`}>
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}
