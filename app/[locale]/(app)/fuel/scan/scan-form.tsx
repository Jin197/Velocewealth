'use client';

import { Link } from '@/lib/i18n/routing';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Hand,
  Loader2,
} from 'lucide-react';
import { OcrScanner } from '@/components/domain/ocr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { addFuelEntryAction } from '@/server/actions/fuel';

type Stage = 'capture' | 'scanning' | 'review';

interface VehicleOpt {
  id: string;
  label: string;
}

interface OcrResult {
  energyType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stationName: string;
  stationCity: string;
}

const fallbackOcr: OcrResult = {
  energyType: 'gasoline',
  quantity: 38.2,
  unitPrice: 1.789,
  totalPrice: 68.34,
  stationName: 'TotalEnergies Access',
  stationCity: 'Lyon',
};

export function ScanForm({
  vehicles,
  defaultVehicleId,
  defaultCurrency,
  isManual,
  isPremium,
}: {
  vehicles: VehicleOpt[];
  defaultVehicleId: string;
  defaultCurrency: string;
  isManual: boolean;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(isManual ? 'review' : 'capture');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [prefill, setPrefill] = useState<Partial<OcrResult> | null>(null);
  const [confidence, setConfidence] = useState<number>();

  // Auto-compute total when qty * unitPrice change
  const [quantity, setQuantity] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  useEffect(() => {
    if (quantity && unitPrice) {
      setTotalPrice(Number((quantity * unitPrice).toFixed(2)));
    }
  }, [quantity, unitPrice]);

  const runOcr = async (file?: File) => {
    setStage('scanning');
    try {
      if (!file) {
        // No file picked: simulate with fallback (still useful for showcase mode)
        await new Promise((r) => setTimeout(r, 1800));
        setPrefill(fallbackOcr);
        setQuantity(fallbackOcr.quantity);
        setUnitPrice(fallbackOcr.unitPrice);
        setTotalPrice(fallbackOcr.totalPrice);
        setConfidence(96);
        setStage('review');
        return;
      }
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/ocr', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'OCR indisponible — saisie manuelle');
        setStage('review');
        return;
      }
      setPrefill(data);
      setQuantity(data.quantity ?? 0);
      setUnitPrice(data.unitPrice ?? 0);
      setTotalPrice(data.totalPrice ?? 0);
      setConfidence(data.confidence);
      setStage('review');
    } catch (e) {
      toast.error('OCR indisponible — saisie manuelle');
      setStage('review');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runOcr(file);
  };

  const handleSubmit = (formData: FormData) => {
    formData.set('totalPrice', String(totalPrice));
    formData.set('quantity', String(quantity));
    formData.set('unitPrice', String(unitPrice));
    startTransition(async () => {
      setError(undefined);
      const res = await addFuelEntryAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success('Dépense enregistrée');
      router.push('/fuel');
    });
  };

  return (
    <div className="container py-6 lg:py-8 max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href="/fuel">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
      </Button>

      <div>
        {!isManual && (
          <Badge variant="premium" className="mb-3">
            <Sparkles className="h-3 w-3" /> Scan OCR · {isPremium ? 'Premium illimité' : '5/mois en gratuit'}
          </Badge>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {stage === 'review'
            ? isManual
              ? 'Saisie manuelle'
              : 'Vérifier les données extraites'
            : 'Scanner un ticket'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stage === 'capture' &&
            'Cadrez le ticket dans le viseur. Le moteur OCR pré-remplira le formulaire.'}
          {stage === 'scanning' && 'Analyse en cours, ne bougez pas…'}
          {stage === 'review' &&
            (isManual
              ? 'Renseignez les informations de votre dépense.'
              : 'Quelques champs sont pré-remplis. Validez ou ajustez avant d\'enregistrer.')}
        </p>
      </div>

      {(stage === 'capture' || stage === 'scanning') && (
        <>
          <OcrScanner
            scanning={stage === 'scanning'}
            onCapture={() => runOcr()}
            onUpload={() => document.getElementById('ocr-upload')?.click()}
          />
          <input
            id="ocr-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}

      {stage === 'review' && (
        <form action={handleSubmit} className="space-y-5">
          {prefill && confidence && (
            <div className="rounded-card bg-eco/10 border border-eco/20 p-3 flex items-start gap-3">
              <CheckCircle2
                className="h-4 w-4 text-eco mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <div className="text-xs">
                <div className="font-medium text-eco">
                  Ticket reconnu avec {confidence} % de confiance
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {prefill.stationName}
                  {prefill.stationCity ? ` · ${prefill.stationCity}` : ''}
                </div>
              </div>
            </div>
          )}

          <Card className="p-5 space-y-4">
            <input
              type="hidden"
              name="currency"
              defaultValue={defaultCurrency}
            />
            <input
              type="hidden"
              name="ocrSource"
              defaultValue={isManual ? 'manual' : 'ocr'}
            />
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
                <Label htmlFor="energyType">Énergie</Label>
                <Select
                  id="energyType"
                  name="energyType"
                  defaultValue={prefill?.energyType ?? 'gasoline'}
                >
                  <option value="gasoline">Essence</option>
                  <option value="diesel">Gazole</option>
                  <option value="electric">Électrique</option>
                  <option value="e85">E85</option>
                  <option value="gpl">GPL</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  className="font-mono"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice">Prix unitaire</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.001"
                  className="font-mono"
                  value={unitPrice || ''}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="totalPrice">Total</Label>
                <Input
                  id="totalPrice"
                  name="totalPrice"
                  type="number"
                  step="0.01"
                  className="font-mono"
                  value={totalPrice || ''}
                  onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                  required
                />
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
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="stationName">Station</Label>
                <Input
                  id="stationName"
                  name="stationName"
                  defaultValue={prefill?.stationName ?? ''}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="stationCity">Ville</Label>
                <Input
                  id="stationCity"
                  name="stationCity"
                  defaultValue={prefill?.stationCity ?? ''}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="mileageKm">Kilométrage au compteur</Label>
                <Input
                  id="mileageKm"
                  name="mileageKm"
                  type="number"
                  className="font-mono"
                  required
                />
              </div>
            </div>
          </Card>

          <FormError message={error} />

          <div className="flex gap-3">
            {!isManual && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStage('capture')}
                disabled={pending}
              >
                <Hand className="h-4 w-4" /> Recommencer
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
