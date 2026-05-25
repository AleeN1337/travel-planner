import type { Activity, PlanDay, TransportMode } from "@/generated/prisma/client";
import { TIME_OF_DAY_ORDER } from "@/lib/labels";
import type { GeoPoint } from "@/lib/geo/nominatim";
import {
  estimateTravelMinutes,
  formatTravelLabel,
  transportLabel,
} from "@/lib/geo/routing";

export type ActivityWithCoords = Activity & {
  coords: GeoPoint | null;
};

export type DayWithRoute = PlanDay & {
  activities: ActivityWithCoords[];
  routeStats: { totalKm: number; totalMin: number; mappedCount: number };
};

export function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const ta = TIME_OF_DAY_ORDER.indexOf(a.timeOfDay);
    const tb = TIME_OF_DAY_ORDER.indexOf(b.timeOfDay);
    if (ta !== tb) return ta - tb;
    return a.orderIndex - b.orderIndex;
  });
}

export function activityCoords(activity: Activity): GeoPoint | null {
  if (activity.latitude == null || activity.longitude == null) return null;
  return { lat: activity.latitude, lng: activity.longitude };
}

export function enrichDay(
  day: PlanDay & { activities: Activity[] },
  transport: TransportMode,
): DayWithRoute {
  const sorted = sortActivities(day.activities);
  const withCoords = sorted.map((a) => ({
    ...a,
    coords: activityCoords(a),
  }));

  const points = withCoords
    .map((a) => a.coords)
    .filter((c): c is GeoPoint => c != null);

  let totalKm = 0;
  let totalMin = 0;
  for (let i = 1; i < points.length; i++) {
    const km =
      Math.round(
        haversineSimple(points[i - 1], points[i]) * 1.35 * 10,
      ) / 10;
    totalKm += km;
    totalMin += estimateTravelMinutes(points[i - 1], points[i], transport);
  }

  return {
    ...day,
    activities: withCoords,
    routeStats: {
      totalKm: Math.round(totalKm * 10) / 10,
      totalMin,
      mappedCount: points.length,
    },
  };
}

function haversineSimple(a: GeoPoint, b: GeoPoint): number {
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

export function travelToNext(
  current: ActivityWithCoords,
  next: ActivityWithCoords,
  transport: TransportMode,
): string | null {
  if (!current.coords || !next.coords) return null;
  const min = estimateTravelMinutes(current.coords, next.coords, transport);
  return `${formatTravelLabel(min)} ${transportLabel(transport)}`;
}

export function computeBudgetByDay(
  days: (PlanDay & { activities: Activity[] })[],
): { dayNumber: number; title: string | null; min: number; max: number }[] {
  return days.map((day) => {
    let min = 0;
    let max = 0;
    for (const a of day.activities) {
      if (a.costMin) min += a.costMin;
      if (a.costMax) max += a.costMax;
    }
    return { dayNumber: day.dayNumber, title: day.title, min, max };
  });
}
