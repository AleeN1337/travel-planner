import { getDb } from "@/lib/db";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { activityCoords, sortActivities } from "@/lib/plans/plan-utils";
import type { GeoPoint } from "@/lib/geo/nominatim";

/** Nearest-neighbor — sensowna kolejność punktów w dzień (zachowuje pory dnia) */
function orderPointsByProximity(
  activities: { id: string; coords: GeoPoint }[],
): string[] {
  if (activities.length <= 1) return activities.map((a) => a.id);

  const remaining = [...activities];
  const ordered: string[] = [];
  let current = remaining.shift()!;
  ordered.push(current.id);

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distKm(current.coords, remaining[i].coords);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current.id);
  }

  return ordered;
}

function distKm(a: GeoPoint, b: GeoPoint): number {
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

export async function optimizeDayActivityOrder(
  plan: TripPlanWithDays,
  dayNumber: number,
): Promise<{ reordered: number }> {
  const day = plan.days.find((d) => d.dayNumber === dayNumber);
  if (!day) throw new Error("Nie znaleziono dnia");

  const db = getDb();
  const timeGroups = new Map<string, typeof day.activities>();

  for (const activity of sortActivities(day.activities)) {
    const coords = activityCoords(activity);
    if (!coords) continue;
    const key = activity.timeOfDay;
    if (!timeGroups.has(key)) timeGroups.set(key, []);
    timeGroups.get(key)!.push(activity);
  }

  let reordered = 0;

  for (const [, group] of timeGroups) {
    const withCoords = group
      .map((a) => ({ id: a.id, coords: activityCoords(a)! }))
      .filter((a) => a.coords);

    if (withCoords.length < 3) continue;

    const orderedIds = orderPointsByProximity(withCoords);
    for (let i = 0; i < orderedIds.length; i++) {
      await db.activity.update({
        where: { id: orderedIds[i] },
        data: { orderIndex: i },
      });
      reordered++;
    }
  }

  return { reordered };
}
