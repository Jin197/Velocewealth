'use client';

import { Link } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Camera,
  Fuel,
  Zap,
  Battery,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { useUser } from '@/components/user-context';
import { createVehicleAction } from '@/server/actions/vehicles';

export default function NewVehiclePage() {
  const router = useRouter();
  const user = useUser();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await createVehicleAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success('Véhicule ajouté');
      router.push(`/vehicles/${res.id}`);
    });
  };

  return (
    <div className="container py-6 lg:py-8 max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/vehicles">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
      </Button>

      <PageHeader
        title="Ajouter un véhicule"
        description="Quelques informations clés pour démarrer le suivi."
      />

      <form action={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Identité
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="make">Marque</Label>
              <Input id="make" name="make" placeholder="Peugeot" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Modèle</Label>
              <Input id="model" name="model" placeholder="3008" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                name="year"
                type="number"
                placeholder="2023"
                defaultValue={new Date().getFullYear()}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trim">Finition</Label>
              <Input id="trim" name="trim" placeholder="GT" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plate">Immatriculation</Label>
              <Input
                id="plate"
                name="plate"
                placeholder="EX-123-AB"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vin">VIN (optionnel)</Label>
              <Input
                id="vin"
                name="vin"
                placeholder="VF3MJ…"
                className="font-mono"
                maxLength={17}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="color">Couleur</Label>
              <Input id="color" name="color" placeholder="Gris Artense" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Motorisation
          </div>
          <fieldset className="grid grid-cols-3 gap-3">
            {[
              { value: 'thermal', label: 'Thermique', icon: Fuel },
              { value: 'electric', label: 'Électrique', icon: Zap },
              { value: 'hybrid', label: 'Hybride', icon: Battery },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <label
                  key={opt.value}
                  className="flex flex-col items-center gap-2 rounded-card border border-border p-4 cursor-pointer hover:border-veloce hover:bg-veloce/5 transition-colors has-[:checked]:border-veloce has-[:checked]:bg-veloce/10"
                >
                  <input
                    type="radio"
                    name="fuelType"
                    value={opt.value}
                    className="sr-only"
                    defaultChecked={opt.value === 'hybrid'}
                  />
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              );
            })}
          </fieldset>
        </Card>

        <Card className="p-6 space-y-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Acquisition & finances
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="purchaseDate">Date d'achat</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">Prix d'achat</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                placeholder="38900"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentMileageKm">Kilométrage actuel</Label>
              <Input
                id="currentMileageKm"
                name="currentMileageKm"
                type="number"
                placeholder="42180"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Devise</Label>
              <Select id="currency" name="currency" defaultValue={user.currency}>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="CAD">$ CAD</option>
                <option value="CHF">Fr CHF</option>
                <option value="MAD">DH MAD</option>
                <option value="XOF">F CFA</option>
                <option value="XAF">F XAF</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="insuranceProvider">Assureur</Label>
              <Input
                id="insuranceProvider"
                name="insuranceProvider"
                placeholder="AXA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="insuranceMonthly">Cotisation mensuelle</Label>
              <Input
                id="insuranceMonthly"
                name="insuranceMonthly"
                type="number"
                step="0.01"
                placeholder="78"
                className="font-mono"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Photo
          </div>
          <Input
            name="imageUrl"
            placeholder="URL d'image (upload Storage Phase 3b)"
          />
          <button
            type="button"
            className="w-full aspect-[16/9] rounded-card border-2 border-dashed border-border hover:border-veloce hover:bg-veloce/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <Camera className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-sm">Upload via Supabase Storage à venir</span>
          </button>
        </Card>

        <FormError message={error} />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            asChild
            className="flex-1"
          >
            <Link href="/vehicles">Annuler</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? 'Enregistrement…' : 'Ajouter le véhicule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
