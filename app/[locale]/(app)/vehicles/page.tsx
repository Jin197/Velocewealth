import { Link } from '@/lib/i18n/routing';
import { Plus, Car } from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { VehicleCard } from '@/components/domain/vehicle-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getVehicles } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage() {
  const vehicles = isSupabaseConfigured() ? await getVehicles() : [];

  if (vehicles.length === 0) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <Car className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            Aucun véhicule pour l'instant
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Ajoutez votre premier véhicule pour commencer le suivi du coût au km.
          </p>
          <Button asChild className="mt-5">
            <Link href="/vehicles/new">
              <Plus className="h-4 w-4" /> Ajouter un véhicule
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Vos véhicules"
        description={`${vehicles.length} véhicule${vehicles.length > 1 ? 's' : ''} dans votre flotte`}
        action={
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="h-4 w-4" /> Ajouter un véhicule
            </Link>
          </Button>
        }
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  );
}
