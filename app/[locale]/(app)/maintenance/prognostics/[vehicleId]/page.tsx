import { notFound } from 'next/navigation';
import { PageHeader, Section } from '@/components/domain/page-header';
import { KpiCard } from '@/components/domain/kpi-card';
import { PhmComponentCard } from '@/components/domain/phm-component-card';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Activity, CheckCircle2, Gauge, BrainCircuit, FileDown, ScanSearch } from 'lucide-react';
import { getVehicle } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { evaluateVehicleHealth, TelemetryData } from '@/lib/phm/engine';
import { buildPhmComponents } from '@/lib/phm/components';
import { formatDistance } from '@/lib/utils';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function PrognosticsPage({
  params,
}: {
  params: Promise<{ vehicleId: string; locale: string }>;
}) {
  const { vehicleId } = await params;
  
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle) notFound();

  const supabase = createClient();

  // 1. Fetch Latest Telemetry (Cold Start data)
  const { data: telemetryData } = await supabase
    .from('telemetry_obd' as any)
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('time', { ascending: false })
    .limit(1)
    .single();

  let latestTelemetry: TelemetryData | null = null;
  if (telemetryData) {
    latestTelemetry = {
      rpm: (telemetryData as any).rpm || 0,
      engineLoad: (telemetryData as any).engine_load || 0,
      speed: (telemetryData as any).speed || 0,
      maf: (telemetryData as any).maf || 0,
      iat: (telemetryData as any).iat || 0,
      coolantTemp: (telemetryData as any).coolant_temp || 0,
      batteryVoltage: (telemetryData as any).battery_voltage || 12.0
    };
  }

  // 2. Fetch Maintenance History to get 'lastChangedKm'
  const { data: maintenanceHistory } = await supabase
    .from('maintenance_entries')
    .select('category, mileage_km')
    .eq('vehicle_id', vehicleId)
    .order('occurred_at', { ascending: false });

  // 3. Construct Components from REAL history + OEM knowledge base (plus de mock)
  const phmComponents = buildPhmComponents(
    vehicle.currentMileageKm,
    vehicle.fuelType,
    maintenanceHistory
  );
  const componentsData = phmComponents.map(c => ({
    name: c.name,
    lastChangedKm: c.lastChangedKm,
    expectedLifetimeKm: c.expectedLifetimeKm,
  }));
  const missingHistoryCount = phmComponents.filter(c => !c.hasRealHistory).length;

  // 4. Run the Machine Learning / PHM Engine
  const prognostics = evaluateVehicleHealth(
    vehicle.currentMileageKm,
    latestTelemetry,
    componentsData
  );

  const hasGlobalAnomaly = prognostics.components.some(c => c.anomalyFlag);

  return (
    <div className="container py-6 lg:py-8 space-y-8">
      <PageHeader
        title="Diagnostic IA & Télémétrie"
        description={`Analyse prédictive de santé pour ${vehicle.make} ${vehicle.model} (${formatDistance(vehicle.currentMileageKm)})`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" asChild>
              <a href={`/api/vehicles/${vehicleId}/certificate`} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Carnet Certifié (PDF)</span>
              </a>
            </Button>
            <Button variant="primary" asChild>
              <Link href={`/vehicles/${vehicleId}`}>Retour véhicule</Link>
            </Button>
          </div>
        }
      />

      {/* Alerte Globale Télémétrie */}
      {hasGlobalAnomaly && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 sm:p-6 flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse-slow">
          <div className="bg-destructive text-destructive-foreground p-3 rounded-xl shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-destructive text-lg">Anomalie Télémétrique Détectée</h2>
            <p className="text-sm text-destructive/90 mt-1">
              Le système a détecté un comportement anormal via le flux OBD-II. Vérifiez les composants critiques ci-dessous immédiatement.
            </p>
          </div>
        </div>
      )}

      {/* Alerte Historique Manquant */}
      {missingHistoryCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-6 flex items-start gap-4">
          <div className="bg-amber-500 text-white p-3 rounded-xl shrink-0">
            <ScanSearch className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-amber-500 text-lg">Historique incomplet ({missingHistoryCount}/{phmComponents.length} composants)</h2>
            <p className="text-sm text-amber-500/90 mt-1">
              {missingHistoryCount === phmComponents.length
                ? "Aucun historique de maintenance trouvé. L'IA utilise les préconisations constructeur (pièces considérées d'origine). Scannez vos factures pour affiner le Jumeau Numérique."
                : `${missingHistoryCount} composant(s) sans historique. Le modèle utilise les intervalles OEM comme référence pour ces pièces.`
              }
            </p>
            <Button variant="outline" size="sm" className="mt-3 border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white" asChild>
              <Link href={`/vehicles/${vehicleId}/maintenance/new`}>Scanner mon historique</Link>
            </Button>
          </div>
        </div>
      )}

      {/* KPIs de Santé */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={prognostics.overallScore < 50 ? 'border border-destructive rounded-xl' : ''}>
          <KpiCard
            label="Score de Santé Global"
            value={`${prognostics.overallScore} / 100`}
            hint={prognostics.overallScore > 80 ? "Excellente condition" : prognostics.overallScore > 50 ? "Nécessite attention" : "État critique"}
            icon={<Activity className={`h-4 w-4 ${prognostics.overallScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`} />}
          />
        </div>
        <KpiCard
          label="Statut Télémétrie"
          value={telemetryData ? "En ligne" : "Hors ligne"}
          hint={telemetryData ? `Dernière trame: ${new Date((telemetryData as any).time).toLocaleTimeString()}` : "Aucune donnée OBD-II récente"}
          icon={<BrainCircuit className="h-4 w-4 text-veloce" />}
        />
        <KpiCard
          label="Modèle RUL"
          value="Weibull & RF"
          hint="Survie dynamique active"
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      {/* Grille des Composants */}
      <Section
        title="État des Composants (Prognostics)"
        description="Durée de vie utile restante (RUL) estimée par le modèle d'IA."
      >
        <div className="grid md:grid-cols-2 gap-4">
          {prognostics.components.map((comp) => {
            const phmComp = phmComponents.find(c => c.name === comp.name);
            return (
              <PhmComponentCard
                key={comp.name}
                name={comp.name}
                status={comp.status}
                confidence={comp.confidence}
                rulKm={comp.rulKm}
                anomalyFlag={comp.anomalyFlag}
                anomalyReason={comp.anomalyReason}
                expectedLifetimeKm={phmComp?.expectedLifetimeKm}
                vehicleId={vehicleId}
                hasRealHistory={phmComp?.hasRealHistory ?? false}
              />
            );
          })}
        </div>
      </Section>
    </div>
  );
}
