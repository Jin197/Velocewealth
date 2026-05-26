import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { Button } from '@/components/ui/button';
import { getVehicle } from '@/lib/data';
import { getInsuranceRecords } from '@/server/actions/insurance';
import { isSupabaseConfigured } from '@/lib/env';
import { VehicleEditForm } from './vehicle-edit-form';

export const dynamic = 'force-dynamic';

export default async function VehicleEditPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) return notFound();
  const [vehicle, insuranceRecords] = await Promise.all([
    getVehicle(params.id),
    getInsuranceRecords(params.id),
  ]);
  if (!vehicle) return notFound();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-3xl mx-auto w-full">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link href={`/vehicles/${vehicle.id}`}>
          <ChevronLeft className="h-4 w-4" />
          Retour à la fiche véhicule
        </Link>
      </Button>

      <PageHeader
        title="Compléter les informations"
        description={`${vehicle.make} ${vehicle.model} · ${vehicle.plate} — modifiez ou ajoutez les détails manquants pour affiner vos calculs.`}
      />

      <VehicleEditForm
        vehicle={vehicle}
        initialInsuranceRecords={insuranceRecords}
      />
    </div>
  );
}
