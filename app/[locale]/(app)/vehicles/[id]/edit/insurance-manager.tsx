'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import {
  setInsuranceModeAction,
  upsertInsuranceRecordAction,
  deleteInsuranceRecordAction,
} from '@/server/actions/insurance';
import type { InsuranceRecord } from '@/lib/types';

interface Props {
  vehicleId: string;
  currency: string;
  initialMode: 'fixed' | 'variable';
  initialFixedAmount: number | null;
  initialProvider: string;
  onProviderChange: (v: string) => void;
  initialRecords: InsuranceRecord[];
}

export function InsuranceManager({
  vehicleId,
  currency,
  initialMode,
  initialFixedAmount,
  initialProvider,
  onProviderChange,
  initialRecords,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'fixed' | 'variable'>(initialMode);
  const [fixedAmount, setFixedAmount] = useState<string>(
    initialFixedAmount != null ? String(initialFixedAmount) : '',
  );
  const [records, setRecords] = useState<InsuranceRecord[]>(initialRecords);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [newMonth, setNewMonth] = useState<string>(thisMonth);
  const [newAmount, setNewAmount] = useState('');

  const handleModeChange = (next: 'fixed' | 'variable') => {
    if (next === mode) return;
    setMode(next);
    startTransition(async () => {
      const res = await setInsuranceModeAction({
        vehicleId,
        mode: next,
        fixedAmount: next === 'fixed' && fixedAmount ? Number(fixedAmount) : null,
      });
      if (res.error) toast.error(res.error);
      else
        toast.success(
          next === 'fixed'
            ? 'Mode fixe activé.'
            : 'Mode variable activé — saisissez vos cotisations mensuelles.',
        );
    });
  };

  const handleFixedBlur = () => {
    if (mode !== 'fixed') return;
    const amount = Number(fixedAmount);
    if (!Number.isFinite(amount) || amount < 0) return;
    startTransition(async () => {
      const res = await setInsuranceModeAction({
        vehicleId,
        mode: 'fixed',
        fixedAmount: amount,
      });
      if (res.error) toast.error(res.error);
    });
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonth || !newAmount) {
      toast.error('Sélectionnez un mois et un montant.');
      return;
    }
    const amount = Number(newAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Montant invalide.');
      return;
    }
    startTransition(async () => {
      const res = await upsertInsuranceRecordAction({
        vehicleId,
        month: newMonth,
        amount,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const monthIso = `${newMonth.slice(0, 7)}-01`;
      setRecords((prev) => {
        const without = prev.filter((r) => r.month !== monthIso);
        return [
          {
            id: res.id ?? crypto.randomUUID(),
            vehicleId,
            userId: '',
            month: monthIso,
            amount,
            currency,
            notes: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...without,
        ].sort((a, b) => b.month.localeCompare(a.month));
      });
      setNewAmount('');
      toast.success('Cotisation enregistrée.');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteInsuranceRecordAction(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const total = records.reduce((s, r) => s + r.amount, 0);
  const average =
    records.length > 0 ? Math.round(total / records.length) : null;

  return (
    <Card className="p-5 space-y-5">
      {/* Provider */}
      <div className="space-y-1.5">
        <Label className="text-xs">Assureur</Label>
        <Input
          value={initialProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          placeholder="AXA, MAIF, Direct Assurance…"
        />
      </div>

      {/* Mode toggle */}
      <div className="space-y-2">
        <Label className="text-xs">Type de cotisation</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('fixed')}
            disabled={pending}
            className={cn(
              'rounded-card border p-3 text-left transition-all',
              mode === 'fixed'
                ? 'border-veloce bg-veloce/5 ring-2 ring-veloce/20'
                : 'border-border bg-card hover:border-border/80',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-veloce" />
              <span className="font-semibold text-sm">Cotisation fixe</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Même montant chaque mois (contrat classique).
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('variable')}
            disabled={pending}
            className={cn(
              'rounded-card border p-3 text-left transition-all',
              mode === 'variable'
                ? 'border-veloce bg-veloce/5 ring-2 ring-veloce/20'
                : 'border-border bg-card hover:border-border/80',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-sm">Cotisation variable</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Pay-as-you-drive, saisonnier, ajustements — saisissez chaque mois.
            </p>
          </button>
        </div>
      </div>

      {/* Fixed-mode amount */}
      {mode === 'fixed' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Cotisation mensuelle ({currency})</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            onBlur={handleFixedBlur}
            placeholder="80"
            className="font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Sauvegardé automatiquement quand vous quittez le champ.
          </p>
        </div>
      )}

      {/* Variable-mode records */}
      {mode === 'variable' && (
        <div className="space-y-3">
          <form
            onSubmit={handleAddRecord}
            className="rounded-card border border-border bg-muted/20 p-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2"
          >
            <div className="space-y-1">
              <Label className="text-[11px]">Mois</Label>
              <Input
                type="month"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Montant ({currency})</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="92.50"
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={pending}
                className="bg-veloce hover:bg-veloce/90 text-white gap-1 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </form>

          {records.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              Aucune cotisation enregistrée. Ajoutez-en une pour démarrer.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {records.length}
                  </span>{' '}
                  cotisation{records.length > 1 ? 's' : ''} enregistrée
                  {records.length > 1 ? 's' : ''} · total{' '}
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(total, currency)}
                  </span>
                  {average != null && (
                    <>
                      {' · moyenne '}
                      <span className="font-mono font-semibold text-foreground">
                        {formatCurrency(average, currency)}/mois
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-card border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Mois</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Montant
                      </th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-border/40 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2 font-mono">
                          {formatMonth(r.month)}
                        </td>
                        <td className="px-3 py-2 font-mono text-right">
                          {formatCurrency(r.amount, r.currency)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            disabled={pending}
                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Badge variant="muted" className="text-[10px]">
                Le coût d'assurance dans vos calculs TCO utilise désormais ces
                cotisations réelles.
              </Badge>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function formatMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
