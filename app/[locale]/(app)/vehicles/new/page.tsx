'use client';

import { Link } from '@/lib/i18n/routing';
import { useRouter } from '@/lib/i18n/routing';
import { useTransition, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
  Sliders,
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

// ── Client-side detection regex (FR & UK) ──
const REGEX_PLATE_FR = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/i;
const REGEX_PLATE_UK = /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/i;
const REGEX_VIN = /^[A-HJ-NPR-Z0-9]{17}$/i;

type LookupSource = 'siv' | 'nhtsa' | 'dvla' | 'cache' | null;

const SOURCE_LABELS: Record<string, { icon: string; label: string }> = {
  siv:   { icon: '🇫🇷', label: 'SIV France' },
  nhtsa: { icon: '🌍', label: 'NHTSA' },
  dvla:  { icon: '🇬🇧', label: 'DVLA UK' },
  cache: { icon: '⚡', label: 'Cache instantané' },
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(undefined);
      const res = await createVehicleAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success('Véhicule ajouté avec succès');
      router.push(`/vehicles/${res.id}`);
    });
  };

  const handleSmartLookup = async (value: string, field: 'plate' | 'vin') => {
    const form = formRef.current;
    const cleaned = value.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
    if (!cleaned || cleaned.length < 4 || !form) return;

    // Validation Regex client-side
    if (field === 'plate' && !REGEX_PLATE_FR.test(cleaned) && !REGEX_PLATE_UK.test(cleaned)) {
      if (cleaned.length < 5) return;
    }

    if (field === 'vin' && (!REGEX_VIN.test(cleaned) || cleaned.length !== 17)) {
      return;
    }

    setIsLookingUp(true);
    setLookupSource(null);

    try {
      const param = field === 'vin' ? `vin=${encodeURIComponent(cleaned)}` : `plate=${encodeURIComponent(cleaned)}`;
      const res = await fetch(`/api/vehicles/lookup?${param}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        if (errorData.fallback === 'try-vin' && field === 'plate') {
          setShowVinFallback(true);
          toast.info(
            'Plaque non trouvée. Saisissez le VIN (17 caractères) pour une recherche gratuite.',
            { duration: 6000, icon: '🔍' }
          );
        } else if (errorData.fallback === 'manual-entry') {
          toast.warning(
            'Immatriculation non reconnue. Saisissez manuellement dans les options avancées.',
            { duration: 5000 }
          );
          setShowAdvanced(true);
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
      toast.success(`${data.make} ${data.model} identifié avec succès ! ${sourceInfo.icon}`, {
        description: sourceInfo.label ? `Source : ${sourceInfo.label}` : undefined,
      });
    } catch {
      // network errors
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
    <div className="container py-6 lg:py-8 max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/vehicles">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
      </Button>

      <PageHeader
        title="Ajouter un véhicule"
        description="Simplifié : Renseignez uniquement la plaque et le kilométrage actuel."
      />

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {/* ── CARD PRIMAIRE : LES 2 SEULS CHAMPS REQUIS ── */}
        <Card className="p-6 space-y-5 border-veloce bg-veloce/5 shadow-[0_0_30px_rgba(0,122,255,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-veloce">
              Saisie rapide
            </div>
            {isLookingUp && (
              <div className="text-xs text-veloce flex items-center gap-1.5 font-mono">
                <Loader2 className="h-3 w-3 animate-spin" /> Identification...
              </div>
            )}
            {lookupSource && !isLookingUp && (
              <div className="text-xs text-emerald-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="h-3 w-3" />
                {SOURCE_LABELS[lookupSource]?.icon} {SOURCE_LABELS[lookupSource]?.label}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="plate" className="font-semibold text-sm">
                Plaque d'immatriculation
              </Label>
              <div className="relative">
                <Input
                  id="plate"
                  name="plate"
                  placeholder="AA-123-AA"
                  className="font-mono pl-10 text-lg tracking-wider"
                  required
                  onBlur={handlePlateBlur}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentMileageKm" className="font-semibold text-sm">
                Kilométrage actuel
              </Label>
              <Input
                id="currentMileageKm"
                name="currentMileageKm"
                type="number"
                placeholder="42000"
                className="font-mono text-lg"
                required
              />
            </div>
          </div>
        </Card>

        {/* ── COLLAPSIBLE TRIGGER FOR ADVANCED OPTIONS ── */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#2D2D2D]/20 hover:bg-[#2D2D2D]/40 text-xs font-medium tracking-wide text-muted-foreground transition-all"
        >
          <span className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5" />
            Personnaliser les informations (Marque, Modèle, Finances...)
          </span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* ── EXPANDABLE PANEL (Framer Motion) ── */}
        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden space-y-4"
            >
              {/* Identity Panel */}
              <Card className="p-6 space-y-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Identité auto-détectée
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="make">Marque</Label>
                    <Input id="make" name="make" placeholder="Auto-rempli (Peugeot)" defaultValue="Peugeot" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model">Modèle</Label>
                    <Input id="model" name="model" placeholder="Auto-rempli (3008)" defaultValue="3008" required />
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
                  <div className={`space-y-1.5 col-span-2 transition-all duration-300 ${showVinFallback ? 'ring-2 ring-veloce/50 rounded-xl p-3 bg-veloce/5' : ''}`}>
                    <Label htmlFor="vin">
                      Code VIN <span className="text-eco text-[10px] font-mono">(Optionnel)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="vin"
                        name="vin"
                        placeholder="17 caractères"
                        className="font-mono pl-10"
                        maxLength={17}
                        onBlur={handleVinBlur}
                      />
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="color">Couleur</Label>
                    <Input id="color" name="color" placeholder="Gris Artense" />
                  </div>
                </div>
              </Card>

              {/* Engine Panel */}
              <Card className="p-6 space-y-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
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
                        <Icon className="h-5 w-5 animate-pulse" strokeWidth={1.5} />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </label>
                    );
                  })}
                </fieldset>
              </Card>

              {/* Finance & Insurance Panel */}
              <Card className="p-6 space-y-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Acquisition & finances
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      defaultValue="0"
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
                    <Input id="insuranceProvider" name="insuranceProvider" placeholder="AXA" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
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

              {/* Photo Panel */}
              <Card className="p-6 space-y-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Photo
                </div>
                <VehiclePhotoUpload name="imageUrl" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <FormError message={error} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" asChild className="flex-1 rounded-full">
            <Link href="/vehicles">Annuler</Link>
          </Button>
          <Button type="submit" className="flex-1 bg-[#007AFF] hover:bg-[#007AFF]/90 rounded-full font-semibold" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? 'Enregistrement…' : 'Ajouter le véhicule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
