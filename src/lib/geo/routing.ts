import type { GeoPoint } from "@/lib/geo/nominatim";
import type { TransportMode } from "@/generated/prisma/client";

const SPEEDS_KMH: Record<TransportMode, number> = {
  WALKING: 4.5,
  PUBLIC_TRANSIT: 22,
  CAR: 35,
  MIXED: 12,
};

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Szacunek czasu dojazdu (min) — w linii prostej × współczynnik ulic */
export function estimateTravelMinutes(
  from: GeoPoint,
  to: GeoPoint,
  transport: TransportMode,
): number {
  const roadFactor = 1.35;
  const km = haversineKm(from, to) * roadFactor;
  const speed = SPEEDS_KMH[transport];
  return Math.max(3, Math.round((km / speed) * 60));
}

export function formatTravelLabel(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h} h ${m} min` : `~${h} h`;
}

export function transportLabel(transport: TransportMode): string {
  switch (transport) {
    case "WALKING":
      return "pieszo";
    case "PUBLIC_TRANSIT":
      return "komunikacją";
    case "CAR":
      return "samochodem";
    default:
      return "mieszany transport";
  }
}

export function dayRouteStats(
  points: GeoPoint[],
  transport: TransportMode,
): { totalKm: number; totalMin: number } {
  let totalKm = 0;
  let totalMin = 0;
  for (let i = 1; i < points.length; i++) {
    const km = haversineKm(points[i - 1], points[i]) * 1.35;
    totalKm += km;
    totalMin += estimateTravelMinutes(points[i - 1], points[i], transport);
  }
  return {
    totalKm: Math.round(totalKm * 10) / 10,
    totalMin,
  };
}
