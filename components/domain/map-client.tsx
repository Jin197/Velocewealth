'use client';

import { useEffect, useState } from 'react';
import { Fuel, Zap, Star, MapPin, Sparkles, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/domain/page-header';
import { StationsMap } from '@/components/domain/stations-map';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Station, Garage } from '@/lib/types';

interface MapClientProps {
  initialStations: Station[];
  initialGarages: Garage[];
  country?: string;
}

export function MapClient({ initialStations, initialGarages, country }: MapClientProps) {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [garages, setGarages] = useState<Garage[]>(initialGarages);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  useEffect(() => {
    const handleViewportChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setStations(customEvent.detail.stations || []);
        setGarages(customEvent.detail.garages || []);
      }
    };
    window.addEventListener('veloce:viewport-change', handleViewportChange);
    return () => {
      window.removeEventListener('veloce:viewport-change', handleViewportChange);
    };
  }, []);

  return (
    <div className="container py-6 lg:py-8 space-y-6">
      <PageHeader
        title="Carte intelligente"
        description={`Recherchez en direct les stations et les garages les plus proches de chez vous.`}
      />

      <StationsMap stations={initialStations} garages={initialGarages} />

      <div className="text-xs text-muted-foreground/80 bg-[#16161A]/60 border border-border/40 backdrop-blur-md rounded-card px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-eco animate-pulse" />
          <span><strong>Mise à jour en temps réel :</strong> Déplacez ou zoomez sur la carte pour charger automatiquement les commerces de proximité.</span>
        </div>
        <Badge variant="muted" className="text-[10px] uppercase font-semibold tracking-wider">Mapbox Engine</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">
              Stations & bornes à proximité ({stations.length})
            </h2>
            <Button variant="ghost" size="sm">Trier par prix</Button>
          </div>
          {stations.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground text-center">
              Aucune station visible sur cette zone. Zoomez ou déplacez la carte pour en charger.
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {stations.map((s) => {
                const isElec = s.type === 'charger';
                return (
                  <Card key={s.id} className="p-4 bg-[#16161A]/80 border-border/50 hover:border-border transition-colors">
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
                        <div className="text-sm font-medium text-white">{s.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" /> {s.city || 'Locale'} · {s.address || 'Adresse de proximité'}
                        </div>
                        {isElec && s.available !== undefined && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-eco font-medium">
                              {s.available}/{s.total} bornes libres
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-white"
                        asChild
                      >
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.address || ''} ${s.city || ''}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Itinéraire"
                        >
                          <Navigation className="h-4 w-4" />
                        </a>
                      </Button>
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
              Garages & réparateurs ({garages.length})
            </h2>
          </div>
          {garages.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground text-center">
              Aucun garage visible sur cette zone. Zoomez ou déplacez la carte pour en charger.
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {garages.map((g) => (
                <Card key={g.id} className="p-4 bg-[#16161A]/80 border-border/50 hover:border-border transition-colors">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="rounded-btn bg-[#007AFF]/10 text-[#007AFF] p-2 shrink-0">
                        <Star className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2 text-white">
                          {g.name}
                          <span className="font-mono text-xs text-amber-400">★ {g.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({g.reviewCount} avis)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {g.address || 'Adresse à proximité'} · {g.city || 'Locale'}
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
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full sm:w-auto mt-2 sm:mt-0 shrink-0 self-center border-white/10 hover:bg-white/5 font-semibold text-xs flex items-center gap-1.5 rounded-full"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.name} ${g.address || ''} ${g.city || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-3 w-3" /> Itinéraire
                      </a>
                    </Button>
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
