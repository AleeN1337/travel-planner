"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DayWithRoute } from "@/lib/plans/plan-utils";
import { cn } from "@/lib/utils";

function numberedIcon(n: number) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div class="map-marker-pin"><span>${n}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 15 });
  }, [map, positions]);
  return null;
}

type PlanMapProps = {
  days: DayWithRoute[];
  className?: string;
};

export function PlanMap({ days, className }: PlanMapProps) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.dayNumber ?? 1);

  const day = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
  const markers = useMemo(() => {
    if (!day) return [];
    return day.activities
      .map((a, i) => ({
        index: i + 1,
        title: a.title,
        location: a.locationName,
        pos: a.coords ? ([a.coords.lat, a.coords.lng] as [number, number]) : null,
      }))
      .filter((m): m is typeof m & { pos: [number, number] } => m.pos != null);
  }, [day]);

  const linePositions = markers.map((m) => m.pos);

  if (days.every((d) => d.routeStats.mappedCount === 0)) {
    return (
      <div
        className={cn(
          "glass-card flex h-64 items-center justify-center rounded-2xl border-white/10 text-sm text-muted-foreground",
          className,
        )}
      >
        Mapa pojawi się po geokodowaniu miejsc (odśwież stronę za chwilę).
      </div>
    );
  }

  const defaultCenter: [number, number] = markers[0]?.pos ?? [38.72, -9.14];

  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl border-white/10", className)}>
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            type="button"
            onClick={() => setSelectedDay(d.dayNumber)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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
          dojazdu łącznie
        </p>
      )}

      <div className="relative h-[320px] w-full sm:h-[380px]">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full z-0"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds positions={linePositions} />
          {linePositions.length > 1 && (
            <Polyline
              positions={linePositions}
              pathOptions={{ color: "#5eead4", weight: 3, opacity: 0.85, dashArray: "8 6" }}
            />
          )}
          {markers.map((m) => (
            <Marker key={m.index} position={m.pos} icon={numberedIcon(m.index)}>
              <Popup>
                <strong>{m.index}. {m.title}</strong>
                {m.location && <br />}
                {m.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
