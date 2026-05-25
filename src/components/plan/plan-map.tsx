"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TransportMode } from "@/generated/prisma/client";
import {
  fetchMapboxRoute,
  getMapboxToken,
  MAPBOX_STYLE,
  type LngLat,
} from "@/lib/geo/mapbox";
import type { DayWithRoute } from "@/lib/plans/plan-utils";
import { MAP_CONTAINER_CLASS } from "@/lib/ui/layout-classes";
import { cn } from "@/lib/utils";

type PlanMapProps = {
  days: DayWithRoute[];
  transport: TransportMode;
  className?: string;
};

function MarkerPin({ index }: { index: number }) {
  return (
    <div className="mapbox-marker flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40">
      {index}
    </div>
  );
}

export function PlanMap({ days, transport, className }: PlanMapProps) {
  const token = getMapboxToken();
  const [selectedDay, setSelectedDay] = useState(days[0]?.dayNumber ?? 1);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [routeGeo, setRouteGeo] = useState<GeoJSON.LineString | null>(null);

  const day = days.find((d) => d.dayNumber === selectedDay) ?? days[0];

  const markers = useMemo(() => {
    if (!day) return [];
    return day.activities
      .map((a, i) => ({
        index: i + 1,
        title: a.title,
        location: a.locationName,
        lngLat: a.coords ? { lng: a.coords.lng, lat: a.coords.lat } : null,
      }))
      .filter((m): m is typeof m & { lngLat: LngLat } => m.lngLat != null);
  }, [day]);

  const fitMapToMarkers = useCallback(() => {
    if (!mapRef || markers.length === 0) return;
    const map = mapRef.getMap();

    if (markers.length === 1) {
      map.flyTo({ center: markers[0].lngLat, zoom: 14, duration: 800 });
      return;
    }

    const lngs = markers.map((m) => m.lngLat.lng);
    const lats = markers.map((m) => m.lngLat.lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 72, maxZoom: 15, duration: 800 },
    );
  }, [mapRef, markers]);

  useEffect(() => {
    fitMapToMarkers();
  }, [fitMapToMarkers, selectedDay]);

  useEffect(() => {
    if (!token || markers.length < 2) {
      setRouteGeo(null);
      return;
    }

    let cancelled = false;
    fetchMapboxRoute(
      markers.map((m) => m.lngLat),
      transport,
      token,
    ).then((geo) => {
      if (!cancelled) setRouteGeo(geo);
    });

    return () => {
      cancelled = true;
    };
  }, [markers, transport, token]);

  const routeSource = useMemo((): GeoJSON.Feature<GeoJSON.LineString> | null => {
    if (routeGeo) {
      return { type: "Feature", properties: {}, geometry: routeGeo };
    }
    if (markers.length < 2) return null;
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: markers.map((m) => [m.lngLat.lng, m.lngLat.lat]),
      },
    };
  }, [routeGeo, markers]);

  if (!token) {
    return (
      <div
        className={cn(
          "glass-card flex flex-col items-center justify-center gap-2 rounded-2xl border-white/10 p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <p className="font-medium text-foreground">Mapa wymaga tokenu Mapbox</p>
        <p>
          Dodaj{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          do pliku .env
        </p>
        <a
          href="https://account.mapbox.com/access-tokens/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Utwórz darmowy token →
        </a>
      </div>
    );
  }

  if (days.every((d) => d.routeStats.mappedCount === 0)) {
    return (
      <div
        className={cn(
          "glass-card flex h-64 items-center justify-center rounded-2xl border-white/10 text-sm text-muted-foreground",
          className,
        )}
      >
        Mapa pojawi się po geokodowaniu miejsc (odśwież stronę).
      </div>
    );
  }

  const initialCenter = markers[0]?.lngLat ?? { lng: -9.14, lat: 38.72 };

  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl border-white/10", className)}>
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            type="button"
            onClick={() => setSelectedDay(d.dayNumber)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selectedDay === d.dayNumber ?
                "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            Dzień {d.dayNumber}
            {d.routeStats.mappedCount > 0 && (
              <span className="ml-1 text-xs opacity-70">
                ({d.routeStats.mappedCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {day && day.routeStats.mappedCount > 0 && (
        <p className="border-b border-white/5 px-4 py-2 text-xs text-muted-foreground">
          Trasa dnia: ~{day.routeStats.totalKm} km · ~{day.routeStats.totalMin} min
          {routeGeo && " · trasa po drogach"}
        </p>
      )}

      <div className={MAP_CONTAINER_CLASS}>
        <Map
          ref={setMapRef}
          mapboxAccessToken={token}
          initialViewState={{
            longitude: initialCenter.lng,
            latitude: initialCenter.lat,
            zoom: 12,
          }}
          mapStyle={MAPBOX_STYLE}
          style={{ width: "100%", height: "100%" }}
          attributionControl={true}
          reuseMaps
        >
          <NavigationControl position="top-right" showCompass={false} />

          {routeSource && (
            <Source id="route" type="geojson" data={routeSource}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#5eead4",
                  "line-width": 4,
                  "line-opacity": 0.9,
                }}
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
              />
              <Layer
                id="route-line-glow"
                type="line"
                paint={{
                  "line-color": "#2dd4bf",
                  "line-width": 8,
                  "line-opacity": 0.25,
                  "line-blur": 2,
                }}
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
              />
            </Source>
          )}

          {markers.map((m) => (
            <Marker
              key={m.index}
              longitude={m.lngLat.lng}
              latitude={m.lngLat.lat}
              anchor="center"
            >
              <MarkerPin index={m.index} />
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  );
}
