'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { toast } from 'sonner';
import {
  Calendar,
  Hash,
  Save,
  ShieldAlert,
  Wallet,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Section } from '@/components/domain/page-header';
import { updateVehicleAction } from '@/server/actions/vehicles';
import { InsuranceManager } from './insurance-manager';
import { VehiclePhotoUpload } from '@/components/domain/vehicle-photo-upload';
import type { Vehicle, InsuranceRecord } from '@/lib/types';

interface Props {
  vehicle: Vehicle;
  initialInsuranceRecords: InsuranceRecord[];
}

export function VehicleEditForm({ vehicle, initialInsuranceRecords }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [plate, setPlate] = useState(vehicle.plate);
  const [vin, setVin] = useState(vehicle.vin ?? '');
  const [trim, setTrim] = useState(vehicle.trim ?? '');
  const [color, setColor] = useState(vehicle.color ?? '');
  const [currentMileage, setCurrentMileage] = useState(
    String(vehicle.currentMileageKm),
  );
  const [purchaseDate, setPurchaseDate] = useState(
    vehicle.purchaseDate.slice(0, 10),
  );
  const [purchasePrice, setPurchasePrice] = useState(
    String(vehicle.purchasePrice ?? ''),
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    vehicle.insuranceProvider ?? '',
  );
  const [registrationFormula, setRegistrationFormula] = useState(
    vehicle.registrationFormulaNumber ?? '',
  );
  // Latest public Supabase URL returned by the photo upload component;
  // submitted to updateVehicleAction so vehicles.image_url is refreshed.
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.set('make', make);
      fd.set('model', model);
      fd.set('year', year);
      fd.set('plate', plate);
      fd.set('vin', vin);
      fd.set('trim', trim);
      fd.set('color', color);
      fd.set('fuelType', vehicle.fuelType);
      fd.set('currency', vehicle.currency);
      fd.set('currentMileageKm', currentMileage);
      fd.set('purchaseDate', purchaseDate);
      fd.set('purchasePrice', purchasePrice);
      fd.set('insuranceProvider', insuranceProvider);
      if (imageUrl) fd.set('imageUrl', imageUrl);

      const res = await updateVehicleAction(vehicle.id, fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      // registration_formula_number isn't in the legacy validator yet —
      // push it separately via the dedicated action.
      if (registrationFormula !== (vehicle.registrationFormulaNumber ?? '')) {
        const { setRegistrationFormulaNumberAction } = await import(
          '@/server/actions/fines'
        );
        await setRegistrationFormulaNumberAction(
          vehicle.id,
          registrationFormula,
        );
      }
      toast.success('Informations enregistrées.');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ── Photo du véhicule ── */}
      <Section
        title="Photo"
        description="JPEG, PNG ou WebP — affichée sur la fiche et le dashboard"
      >
        <Card className="p-5">
          {vehicle.imageUrl && !imageUrl && (
            <p className="text-[11px] text-muted-foreground mb-2">
              Une photo est déjà associée à ce véhicule. En téléverser une
              nouvelle la remplacera après enregistrement.
            </p>
          )}
          <VehiclePhotoUpload
            name="imageUrl"
            onUploaded={(_path, url) => setImageUrl(url)}
          />
        </Card>
      </Section>

      {/* ── Identité véhicule ── */}
      <Section
        title="Identité"
        description="Marque, modèle, plaque — utilisés sur toutes les pages"
      >
        <Card className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Marque" required>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
                maxLength={50}
              />
            </Field>
            <Field label="Modèle" required>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                maxLength={80}
              />
            </Field>
            <Field label="Finition / version">
              <Input
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                placeholder="Ex: GT Line, Sport, Allure…"
              />
            </Field>
            <Field label="Couleur">
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex: Gris Platinium"
              />
            </Field>
            <Field label="Plaque d'immatriculation" required>
              <Input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                required
                className="font-mono uppercase"
              />
            </Field>
            <Field label="VIN (17 caractères)" hint="Optionnel — utile pour la revente">
              <Input
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                maxLength={17}
                className="font-mono uppercase"
                placeholder="WVWZZZ3CZWE…"
              />
            </Field>
            <Field
              label="Numéro de formule (carte grise)"
              hint="Lettre suivie de 10 chiffres, en haut à droite de la carte grise"
            >
              <Input
                value={registrationFormula}
                onChange={(e) => setRegistrationFormula(e.target.value)}
                placeholder="2023BA12345"
                className="font-mono"
              />
            </Field>
            <Field label="Année de mise en circulation" required>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1950}
                max={new Date().getFullYear() + 1}
                required
                className="font-mono"
              />
            </Field>
            <Field label="Kilométrage actuel" required>
              <Input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                min={0}
                required
                className="font-mono"
              />
            </Field>
          </div>
        </Card>
      </Section>

      {/* ── Achat / valeur ── */}
      <Section
        title="Achat & valeur"
        description="Sert au calcul du coût total et de la valeur de revente"
      >
        <Card className="p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Date d'achat" required>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </Field>
          <Field label={`Prix d'achat (${vehicle.currency})`}>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="font-mono"
              placeholder="15000"
            />
          </Field>
        </Card>
      </Section>

      {/* ── Assurance — composant dédié, géré côté serveur ── */}
      <Section
        title="Assurance"
        description="Choisissez si votre cotisation est constante ou variable mois par mois"
      >
        <InsuranceManager
          vehicleId={vehicle.id}
          currency={vehicle.currency}
          initialMode={vehicle.insuranceMode ?? 'fixed'}
          initialFixedAmount={vehicle.insuranceMonthly ?? null}
          initialProvider={insuranceProvider}
          onProviderChange={setInsuranceProvider}
          initialRecords={initialInsuranceRecords}
        />
      </Section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={pending} onClick={() => router.back()}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="bg-veloce hover:bg-veloce/90 text-white gap-1.5"
        >
          <Save className="h-4 w-4" />
          {pending ? 'Enregistrement…' : 'Enregistrer les informations'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1">
        {label}
        {required && (
          <span className="text-destructive" aria-label="obligatoire">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>
      )}
    </div>
  );
}
