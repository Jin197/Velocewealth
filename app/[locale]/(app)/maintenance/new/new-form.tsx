'use client';

import { Link } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, Camera, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { addMaintenanceAction } from '@/server/actions/maintenance';

export function NewMaintenanceForm({
  vehicles,
  defaultVehicleId,
  defaultCurrency,
}: {
  vehicles: { id: string; label: string }[];
  defaultVehicleId: string;
  defaultCurrency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await addMaintenanceAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success('Intervention ajoutée au carnet certifié', {
        description: res.hash ? `Hash : ${res.hash.slice(0, 12)}…` : undefined,
      });
      router.push('/maintenance');
    });
  };

  return (
    <div className="container py-6 lg:py-8 max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/maintenance">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
      </Button>

      <PageHeader
        title="Nouvelle intervention"
        description="Cette ligne sera signée et ajoutée au carnet certifié"
      />

      <form action={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <input type="hidden" name="currency" value={defaultCurrency} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vehicleId">Véhicule</Label>
              <Select
                id="vehicleId"
                name="vehicleId"
                defaultValue={defaultVehicleId}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Catégorie</Label>
              <Select id="category" name="category" defaultValue="oil">
                <option value="oil">Vidange</option>
                <option value="tires">Pneumatiques</option>
                <option value="brakes">Freinage</option>
                <option value="filter">Filtres</option>
                <option value="battery">Batterie</option>
                <option value="inspection">Contrôle technique</option>
                <option value="other">Autre</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="occurredAt">Date</Label>
              <Input
                id="occurredAt"
                name="occurredAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileageKm">Kilométrage</Label>
              <Input
                id="mileageKm"
                name="mileageKm"
                type="number"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Coût</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="garageName">Garage</Label>
              <Input
                id="garageName"
                name="garageName"
                placeholder="Nom du garage"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Pièces remplacées, prestations…"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nextDueMileage">Prochain entretien (km)</Label>
              <Input
                id="nextDueMileage"
                name="nextDueMileage"
                type="number"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nextDueDate">Prochaine échéance</Label>
              <Input id="nextDueDate" name="nextDueDate" type="date" />
            </div>
          </div>
          <button
            type="button"
            className="w-full rounded-card border-2 border-dashed border-border hover:border-veloce hover:bg-veloce/5 p-6 flex flex-col items-center gap-2 text-muted-foreground transition-colors"
          >
            <Camera className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-sm">Joindre la facture (Phase 3b)</span>
          </button>
        </Card>

        <FormError message={error} />

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/maintenance">Annuler</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? 'Signature en cours…' : 'Enregistrer & signer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
