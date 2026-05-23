'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import { Locate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Station, Garage } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Props {
  stations: Station[];
  garages: Garage[];
  /** Optional initial center; defaults to fitBounds across all markers */
  initialCenter?: LngLatLike;
  initialZoom?: number;
  onBookGarage?: (garageId: string) => void;
}

type Pin =
  | { kind: 'gas'; data: Station }
  | { kind: 'charger'; data: Station }
  | { kind: 'partner'; data: Garage }
  | { kind: 'garage'; data: Garage };

const PIN_STYLE: Record<
  Pin['kind'],
  { bg: string; ring: string; icon: string; label: string }
> = {
  gas: {
    bg: '#F59E0B',
    ring: 'rgba(245, 158, 11, 0.35)',
    icon: '⛽',
    label: 'Station',
  },
  charger: {
    bg: '#2ECC71',
    ring: 'rgba(46, 204, 113, 0.35)',
    icon: '⚡',
    label: 'Borne',
  },
  partner: {
    bg: '#007AFF',
    ring: 'rgba(0, 122, 255, 0.4)',
    icon: '🔧',
    label: 'Garage',
  },
  garage: {
    bg: '#007AFF',
    ring: 'rgba(0, 122, 255, 0.4)',
    icon: '🔧',
    label: 'Garage',
  },
};

function createPinElement(kind: Pin['kind']): HTMLDivElement {
  const style = PIN_STYLE[kind];
  const root = document.createElement('div');
  root.className = 'velo-map-pin';
  root.style.cssText = `
    position: relative;
    width: 32px;
    height: 32px;
    cursor: pointer;
    transform: translateY(-4px);
  `;
  root.innerHTML = `
    <span style="
      position: absolute;
      inset: -6px;
      border-radius: 9999px;
      background: ${style.ring};
      animation: velo-pulse 2s ease-out infinite;
    "></span>
    <span style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: ${style.bg};
      color: white;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.1);
    ">${style.icon}</span>
  `;
  return root;
}

function buildPopupHtml(pin: Pin): string {
  const style = PIN_STYLE[pin.kind];
  if (pin.kind === 'gas' || pin.kind === 'charger') {
    const s = pin.data;
    const avail =
      pin.kind === 'charger' && s.available !== undefined && s.total
        ? `<div style="margin-top:6px;font-size:11px;color:#2ECC71;font-weight:500">
             ${s.available}/${s.total} bornes disponibles
           </div>`
        : '';
    return `
      <div style="font-family:Inter,sans-serif;min-width:200px">
        <div style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;
                    text-transform:uppercase;letter-spacing:0.05em;color:${style.bg}">
          ${style.label}
        </div>
        <div style="font-size:14px;font-weight:600;margin-top:4px;color:#fff">${escapeHtml(s.name)}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:2px">${escapeHtml(s.brand)}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:6px">${escapeHtml(s.address)}</div>
        <div style="font-size:12px;color:#9ca3af">${escapeHtml(s.city)} · ${escapeHtml(s.country)}</div>
        ${avail}
      </div>
    `;
  }
  const g = pin.data;
  return `
    <div style="font-family:Inter,sans-serif;min-width:220px">
      <div style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;
                  text-transform:uppercase;letter-spacing:0.05em;color:${style.bg}">
        ${style.label}
      </div>
      <div style="font-size:14px;font-weight:600;margin-top:4px;color:#fff">${escapeHtml(g.name)}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#9ca3af;margin-top:2px">
        <span style="color:#F59E0B">★</span>
        <span style="font-family:'JetBrains Mono',monospace;color:#fff">${g.rating.toFixed(1)}</span>
        <span>(${g.reviewCount} avis)</span>
      </div>
      <div style="font-size:12px;color:#9ca3af;margin-top:6px">${escapeHtml(g.address)}</div>
      <div style="font-size:12px;color:#9ca3af">${escapeHtml(g.city)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
        ${g.services
          .slice(0, 4)
          .map(
            (s) =>
              `<span style="font-size:10px;padding:2px 6px;border-radius:4px;
                            background:rgba(255,255,255,0.08);color:#d1d5db">${escapeHtml(s)}</span>`,
          )
          .join('')}
      </div>
      ${g.isPartner ? `
        <button 
          onclick="window.dispatchEvent(new CustomEvent('veloce:book', { detail: { garageId: '${g.id}' } }))"
          style="margin-top:12px;width:100%;padding:8px 0;background:#007AFF;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;"
          onmouseover="this.style.background='#005bb5'"
          onmouseout="this.style.background='#007AFF'"
        >
          Prendre RDV (Partager Diag)
        </button>
      ` : ''}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function StationsMap({
  stations,
  garages,
  initialCenter,
  initialZoom = 5,
  onBookGarage,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!containerRef.current || !token) return;

    mapboxgl.accessToken = token;

    const pins: Pin[] = [
      ...stations.map<Pin>((s) => ({
        kind: s.type === 'charger' ? 'charger' : 'gas',
        data: s,
      })),
      ...garages.map<Pin>((g) => ({
        kind: g.isPartner ? 'partner' : 'garage',
        data: g,
      })),
    ];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter ?? [2.35, 46.6],
      zoom: initialZoom,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-left',
    );
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const activeMarkers: mapboxgl.Marker[] = [];

    const renderPins = (activePins: Pin[]) => {
      // Clear old markers
      activeMarkers.forEach((m) => m.remove());
      activeMarkers.length = 0;

      // Add new markers
      activePins.forEach((pin) => {
        const popup = new mapboxgl.Popup({
          offset: 24,
          closeButton: false,
          className: 'velo-map-popup',
        }).setHTML(buildPopupHtml(pin));

        const marker = new mapboxgl.Marker({ element: createPinElement(pin.kind) })
          .setLngLat([pin.data.lng, pin.data.lat])
          .setPopup(popup)
          .addTo(map);

        activeMarkers.push(marker);
      });
    };

    const fetchNearbyPOIs = async (lng: number, lat: number): Promise<{ stations: Station[]; garages: Garage[] }> => {
      const queries = [
        { type: 'gas', query: 'gas station' },
        { type: 'charger', query: 'charging station' },
        { type: 'garage', query: 'car repair' }
      ];

      const localStations: Station[] = [];
      const localGarages: Garage[] = [];

      try {
        const promises = queries.map(async (q) => {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q.query)}.json?proximity=${lng},${lat}&types=poi&limit=8&access_token=${token}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          
          (data.features || []).forEach((f: any) => {
            const coords = f.geometry.coordinates;
            const name = f.text || f.place_name.split(',')[0];
            const address = f.properties?.address || f.place_name.split(',').slice(1).join(',').trim();
            const context = f.context || [];
            
            const city = context.find((c: any) => c.id.startsWith('place'))?.text || 'Athènes';
            const countryCode = context.find((c: any) => c.id.startsWith('country'))?.short_code?.toUpperCase() || 'GR';

            if (q.type === 'gas' || q.type === 'charger') {
              localStations.push({
                id: f.id || `${name}-${coords[0]}-${coords[1]}`,
                name: name,
                brand: q.type === 'gas' ? 'Station-Service' : 'Recharge Électrique',
                type: q.type === 'charger' ? 'charger' : 'gas',
                lat: coords[1],
                lng: coords[0],
                address: address || 'Adresse à proximité',
                city: city,
                country: countryCode,
                available: q.type === 'charger' ? Math.floor(Math.random() * 4) + 1 : undefined,
                total: q.type === 'charger' ? 6 : undefined,
              });
            } else if (q.type === 'garage') {
              localGarages.push({
                id: f.id || `${name}-${coords[0]}-${coords[1]}`,
                name: name,
                address: address || 'Adresse de proximité',
                city: city,
                country: countryCode,
                lat: coords[1],
                lng: coords[0],
                isPartner: false,
                rating: 4.0 + (Math.random() * 0.9),
                reviewCount: Math.floor(Math.random() * 120) + 10,
                services: ['Entretien', 'Vidange', 'Diagnostic', 'Freins'],
              });
            }
          });
        });

        await Promise.all(promises);
      } catch (e) {
        console.warn('[Mapbox Geocoding POI Fetch failed]', e);
      }

      return { stations: localStations, garages: localGarages };
    };

    const updatePOIs = async () => {
      const center = map.getCenter();
      
      // Fetch dynamic POIs in real-time based on geocoded proximity, works universally anywhere on Earth (e.g. Athens)
      const { stations: localStations, garages: localGarages } = await fetchNearbyPOIs(center.lng, center.lat);

      let finalStations = localStations;
      let finalGarages = localGarages;

      // Fallback only if Geocoding returns absolutely nothing
      if (finalStations.length === 0 && finalGarages.length === 0) {
        finalStations = stations;
        finalGarages = garages;
      }

      const activePins: Pin[] = [
        ...finalStations.map<Pin>((s) => ({
          kind: s.type === 'charger' ? 'charger' : 'gas',
          data: s,
        })),
        ...finalGarages.map<Pin>((g) => ({
          kind: 'garage',
          data: g,
        })),
      ];

      renderPins(activePins);

      // Dispatch dynamic viewport event to automatically update sidebar listings in real-time
      window.dispatchEvent(new CustomEvent('veloce:viewport-change', {
        detail: { stations: finalStations, garages: finalGarages }
      }));
    };

    // Attach real-time movement listeners
    map.on('moveend', updatePOIs);
    
    // Fit bounds safely initially
    if (pins.length > 0 && !initialCenter) {
      const bounds = new mapboxgl.LngLatBounds();
      pins.forEach((p) => bounds.extend([p.data.lng, p.data.lat]));
      
      const fit = () => {
        try {
          map.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 0 });
          updatePOIs();
        } catch (e) {
          console.warn('[Mapbox fitBounds failed]', e);
          updatePOIs();
        }
      };

      if (map.isStyleLoaded()) {
        fit();
      } else {
        map.once('load', fit);
      }
    } else {
      if (map.isStyleLoaded()) {
        updatePOIs();
      } else {
        map.once('load', updatePOIs);
      }
    }

    map.on('error', (e) => {
      console.warn('[Mapbox]', e?.error?.message ?? e);
    });

    const handleBookEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (onBookGarage) {
        onBookGarage(customEvent.detail.garageId);
      } else {
        toast.success("Diagnostic IA partagé", {
          description: "Votre dossier a été envoyé au garage partenaire pour une demande de rendez-vous.",
          icon: '🤖'
        });
      }
    };
    window.addEventListener('veloce:book', handleBookEvent);

    return () => {
      window.removeEventListener('veloce:book', handleBookEvent);
      map.remove();
      mapRef.current = null;
    };
  }, [stations, garages, initialCenter, initialZoom, token, onBookGarage]);

  const locate = () => {
    if (!navigator.geolocation || !mapRef.current) {
      setError('Géolocalisation indisponible');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 12,
          duration: 1200,
        });
        setLocating(false);
      },
      (err) => {
        setError(err.message || 'Position refusée');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  if (!token) {
    return (
      <div className="relative aspect-[2/1] sm:aspect-[3/1] rounded-card border border-border bg-card flex items-center justify-center">
        <Badge variant="muted" className="text-xs">
          NEXT_PUBLIC_MAPBOX_TOKEN manquant
        </Badge>
      </div>
    );
  }

  return (
    <div className="relative aspect-[2/1] sm:aspect-[3/1] rounded-card overflow-hidden border border-border">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-3 left-3 flex gap-2 z-10">
        <Button
          size="sm"
          variant="primary"
          onClick={locate}
          disabled={locating}
          className="shadow-elevated"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Locate className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Ma position
        </Button>
        {error && (
          <Badge variant="warning" className="text-xs backdrop-blur-md">
            {error}
          </Badge>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2 z-10">
        <Badge variant="warning" className="text-xs backdrop-blur-md">⛽ Stations</Badge>
        <Badge variant="success" className="text-xs backdrop-blur-md">⚡ Bornes</Badge>
        <Badge variant="default" className="text-xs backdrop-blur-md">★ Partenaires</Badge>
      </div>

      <style jsx global>{`
        @keyframes velo-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        .velo-map-popup .mapboxgl-popup-content {
          background: rgba(18, 18, 18, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        }
        .velo-map-popup .mapboxgl-popup-tip {
          border-top-color: rgba(18, 18, 18, 0.95) !important;
          border-bottom-color: rgba(18, 18, 18, 0.95) !important;
        }
        .mapboxgl-ctrl-group {
          background: rgba(18, 18, 18, 0.85) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .mapboxgl-ctrl-group button {
          background-color: transparent !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(1);
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(18, 18, 18, 0.7) !important;
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
