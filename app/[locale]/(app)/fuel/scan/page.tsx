import { Link } from '@/lib/i18n/routing';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getVehicles, getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { ScanForm } from './scan-form';

export const dynamic = 'force-dynamic';

export default async function ScanPage({
  searchParams,
}: {
  searchParams: { vehicle?: string; manual?: string };
}) {
  const [vehicles, profile] = await Promise.all([
    isSupabaseConfigured() ? getVehicles() : Promise.resolve([]),
    isSupabaseConfigured() ? getProfile() : Promise.resolve(null),
  ]);

  if (vehicles.length === 0) {
    return (
      <div className="container py-12">
        <Card className="p-10 max-w-xl mx-auto text-center">
          <div className="rounded-full bg-veloce/10 text-veloce h-14 w-14 mx-auto flex items-center justify-center">
            <Car className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold mt-5">
            Ajoutez un véhicule d'abord
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Une dépense énergie doit être rattachée à un véhicule.
          </p>
          <Button asChild className="mt-5">
            <Link href="/vehicles/new">Ajouter un véhicule</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ScanForm
      vehicles={vehicles.map((v) => ({
        id: v.id,
        label: `${v.make} ${v.model} · ${v.plate}`,
      }))}
      defaultVehicleId={searchParams.vehicle ?? vehicles[0].id}
      defaultCurrency={profile?.currency ?? 'EUR'}
      isManual={searchParams.manual === '1'}
      isPremium={profile?.planTier === 'premium'}
    />
  );
}
