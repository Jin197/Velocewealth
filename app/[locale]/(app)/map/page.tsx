import { getStations, getGarages, getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { Card } from '@/components/ui/card';
import { MapClient } from '@/components/domain/map-client';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;

  const profile = await getProfile();
  const country = profile?.country;
  const [stations, garages] = await Promise.all([
    getStations(country),
    getGarages(country),
  ]);

  return (
    <MapClient
      initialStations={stations}
      initialGarages={garages}
      country={country}
    />
  );
}

function NotConfigured() {
  return (
    <div className="container py-12">
      <Card className="p-10 max-w-2xl mx-auto text-center">
        <h1 className="font-display text-xl font-bold">
          Backend non configuré
        </h1>
        <p className="text-muted-foreground mt-2">
          La carte affiche les stations et garages depuis Supabase. Branchez le
          backend pour activer cette page.
        </p>
      </Card>
    </div>
  );
}
