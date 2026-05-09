import { Fuel, Zap, Star, MapPin, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/domain/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStations, getGarages, getProfile } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;

  const profile = await getProfile();
  const country = profile?.country;
  const [stations, garages] = await Promise.all([
    getStations(country),
    getGarages(country),
  ]);

  const partnerGarages = garages.filter((g) => g.isPartner);
  const otherGarages = garages.filter((g) => !g.isPartner);

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Carte intelligente"
        description={`Stations et garages partenaires${country ? ` · ${country}` : ''}`}
      />

      <Card className="overflow-hidden p-0 relative aspect-[2/1] sm:aspect-[3/1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,122,255,0.18),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(46,204,113,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-[30%] left-[20%] flex items-center justify-center">
          <span className="absolute h-12 w-12 rounded-full bg-amber-500/30 animate-pulse" />
          <span className="relative h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
            <Fuel className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
        <div className="absolute top-[55%] left-[55%] flex items-center justify-center">
          <span className="absolute h-12 w-12 rounded-full bg-eco/30 animate-pulse" />
          <span className="relative h-8 w-8 rounded-full bg-eco flex items-center justify-center text-white">
            <Zap className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
        <div className="absolute top-[40%] left-[75%] flex items-center justify-center">
          <span className="absolute h-12 w-12 rounded-full bg-veloce/30 animate-pulse" />
          <span className="relative h-8 w-8 rounded-full bg-veloce flex items-center justify-center text-white">
            <Star className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Badge variant="muted" className="text-xs backdrop-blur-md">
            Mapbox interactif activé une fois NEXT_PUBLIC_MAPBOX_TOKEN renseigné
          </Badge>
          <div className="flex gap-2 text-xs">
            <Badge variant="warning">Stations</Badge>
            <Badge variant="success">Bornes</Badge>
            <Badge variant="default">Garages partenaires</Badge>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">
              Stations & bornes ({stations.length})
            </h2>
            <Button variant="ghost" size="sm">Trier par prix</Button>
          </div>
          {stations.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground text-center">
              Pas encore de station en base. Le seed initial peuple FR/BE/CH/MA/SN/CA — voir <code className="font-mono">supabase/seed.sql</code>.
            </Card>
          ) : (
            <div className="space-y-2">
              {stations.map((s) => {
                const isElec = s.type === 'charger';
                return (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-btn p-2 shrink-0 ${
                          isElec
                            ? 'bg-eco/10 text-eco'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {isElec ? (
                          <Zap className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <Fuel className="h-4 w-4" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" /> {s.city} · {s.country}
                        </div>
                        {isElec && s.available !== undefined && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-eco font-medium">
                              {s.available}/{s.total} disponibles
                            </span>
                            <div className="flex-1 h-1 rounded-pill bg-muted overflow-hidden">
                              <div
                                className="h-full bg-eco"
                                style={{
                                  width: `${((s.available ?? 0) / (s.total ?? 1)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold">
              Garages partenaires
            </h2>
            <Badge variant="premium" className="text-[10px]">
              <Sparkles className="h-2.5 w-2.5" /> Mise en avant
            </Badge>
          </div>
          {garages.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground text-center">
              Aucun garage en base pour le moment.
            </Card>
          ) : (
            <div className="space-y-2">
              {partnerGarages.map((g) => (
                <Card key={g.id} variant="premium" className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-btn bg-veloce/10 text-veloce p-2 shrink-0">
                      <Star className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {g.name}
                        <span className="font-mono text-xs">{g.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({g.reviewCount})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {g.address} · {g.city}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {g.services.slice(0, 4).map((s) => (
                          <Badge
                            key={s}
                            variant="muted"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm">Prendre RDV</Button>
                  </div>
                </Card>
              ))}

              {otherGarages.length > 0 && (
                <h3 className="font-display text-sm font-medium text-muted-foreground pt-3">
                  Autres garages
                </h3>
              )}
              {otherGarages.map((g) => (
                <Card key={g.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-btn bg-muted p-2 shrink-0 text-muted-foreground">
                      <Star className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {g.name}
                        <span className="font-mono text-xs">{g.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {g.city}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
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
