'use client';

import { Link } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { useTransition, useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Fuel,
  Zap,
  Battery,
  Loader2,
  Search,
  Globe,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { VehiclePhotoUpload } from '@/components/domain/vehicle-photo-upload';
import { useUser } from '@/components/user-context';
import { createVehicleAction } from '@/server/actions/vehicles';

// ── Regex de détection côté client (validation avant envoi) ──────
const REGEX_PLATE_FR = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/i;
const REGEX_PLATE_UK = /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/i;
const REGEX_VIN = /^[A-HJ-NPR-Z0-9]{17}$/i;

type LookupSource = 'siv' | 'nhtsa' | 'dvla' | 'cache' | null;

const SOURCE_LABELS: Record<string, { icon: string; label: string }> = {
  siv:   { icon: '🇫🇷', label: 'SIV France' },
  nhtsa: { icon: '🌍', label: 'NHTSA (Gratuit)' },
  dvla:  { icon: '🇬🇧', label: 'DVLA UK' },
  cache: { icon: '⚡', label: 'Cache (instant)' },
};

export default function NewVehiclePage() {
  const router = useRouter();
  const user = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupSource, setLookupSource] = useState<LookupSource>(null);
  const [showVinFallback, setShowVinFallback] = useState(false);

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

  /**
   * Détection automatique de l'input : si c'est un VIN, envoyer comme VIN.
   * Si c'est une plaque, envoyer comme plaque. Sinon, envoyer comme query générique.
   */
  const handleSmartLookup = async (value: string, field: 'plate' | 'vin') => {
    const form = formRef.current;
    const cleaned = value.toUpperCase().replace(/\s/g, '');
    if (!cleaned || cleaned.length < 4 || !form) return;

    // Validation Regex côté client (anti-abus : évite d'envoyer des requêtes inutiles)
    if (field === 'plate' && !REGEX_PLATE_FR.test(cleaned) && !REGEX_PLATE_UK.test(cleaned)) {
      // Format inconnu mais pas vide → ne pas bloquer, laisser le backend décider
      if (cleaned.length < 5) return;
    }

    if (field === 'vin' && (!REGEX_VIN.test(cleaned) || cleaned.length !== 17)) {
      return; // VIN doit faire exactement 17 chars valides
    }

    setIsLookingUp(true);
    setLookupSource(null);

    try {
      const param = field === 'vin' ? `vin=${encodeURIComponent(cleaned)}` : `plate=${encodeURIComponent(cleaned)}`;
      const res = await fetch(`/api/vehicles/lookup?${param}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // ── Fallback progressif ──────────────────────────────────
        if (errorData.fallback === 'try-vin' && field === 'plate') {
          setShowVinFallback(true);
          toast.info(
            'Plaque non trouvée. Essayez avec le numéro VIN (17 caractères) pour une recherche gratuite.',
            { duration: 6000, icon: '🔍' }
          );
        } else if (errorData.fallback === 'manual-entry') {
          toast.warning(
            'Identifiant non reconnu. Remplissez le formulaire manuellement.',
            { duration: 5000 }
          );
        } else if (res.status === 422) {
          toast.error(errorData.error || 'Format invalide.');
        } else {
          toast.error(errorData.error || 'Véhicule introuvable.');
        }
        return;
      }

      const data = await res.json();
      fillFormFromLookup(form, data);
      setLookupSource(data.source || null);
      setShowVinFallback(false);

      const sourceInfo = SOURCE_LABELS[data.source] || { icon: '✅', label: '' };
      toast.success(`${data.make} ${data.model} identifié ! ${sourceInfo.icon}`, {
        description: sourceInfo.label ? `Source : ${sourceInfo.label}` : undefined,
      });
    } catch {
      // Erreur réseau — mode silencieux
    } finally {
      setIsLookingUp(false);
    }
  };

  const handlePlateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSmartLookup(e.target.value, 'plate');
  };

  const handleVinBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSmartLookup(e.target.value, 'vin');
  };

  const fillFormFromLookup = (form: HTMLFormElement, data: any) => {
    if (data.make) (form.elements.namedItem('make') as HTMLInputElement).value = data.make;
    if (data.model) (form.elements.namedItem('model') as HTMLInputElement).value = data.model;
    if (data.year) (form.elements.namedItem('year') as HTMLInputElement).value = data.year;
    if (data.trim) (form.elements.namedItem('trim') as HTMLInputElement).value = data.trim;
    if (data.vin) (form.elements.namedItem('vin') as HTMLInputElement).value = data.vin;
    if (data.color) (form.elements.namedItem('color') as HTMLInputElement).value = data.color;
    if (data.fuel_type) {
      const radio = form.querySelector(`input[name="fuelType"][value="${data.fuel_type}"]`) as HTMLInputElement;
      if (radio) radio.checked = true;
    }
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
        description="Entrez votre plaque ou VIN pour un remplissage automatique instantané."
      />

      <form ref={formRef} action={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Identité
            </div>
            {isLookingUp && (
              <div className="text-xs text-veloce flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Recherche en cours...
              </div>
            )}
            {lookupSource && !isLookingUp && (
              <div className="text-xs text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                {SOURCE_LABELS[lookupSource]?.icon} {SOURCE_LABELS[lookupSource]?.label}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="plate">Immatriculation <span className="text-muted-foreground text-xs">(FR, UK, ou autre)</span></Label>
              <div className="relative">
                <Input
                  id="plate"
                  name="plate"
                  placeholder="AA-123-AA"
                  className="font-mono pl-10"
                  required
                  onBlur={handlePlateBlur}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
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
            <div className={`space-y-1.5 sm:col-span-2 transition-all duration-300 ${showVinFallback ? 'ring-2 ring-veloce/50 rounded-xl p-3 bg-veloce/5' : ''}`}>
              <Label htmlFor="vin">
                VIN <span className="text-eco text-xs">(auto-détection gratuite via NHTSA)</span>
                {showVinFallback && (
                  <span className="text-veloce text-xs ml-1 animate-pulse">← Essayez ici</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="vin"
                  name="vin"
                  placeholder="Saisissez 17 caractères pour identifier le véhicule"
                  className="font-mono pl-10"
                  maxLength={17}
                  onBlur={handleVinBlur}
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
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
              <Label htmlFor="purchaseDate">Date d&apos;achat</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">Prix d&apos;achat</Label>
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
                <option value="GBP">£ GBP</option>
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
            Photo du véhicule
          </div>
          <VehiclePhotoUpload name="imageUrl" />
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
