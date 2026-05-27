import type { PaceLevel, TransportMode } from "@/generated/prisma/client";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { enrichDay } from "@/lib/plans/plan-utils";
import { formatTravelLabel } from "@/lib/geo/routing";

const MAX_TRAVEL_MIN: Record<PaceLevel, number> = {
  RELAXED: 180,
  BALANCED: 300,
  INTENSE: 420,
};

export type DayRouteInsight = {
  dayNumber: number;
  planDayId: string;
  totalKm: number;
  totalMin: number;
  mappedCount: number;
  activityCount: number;
  overloaded: boolean;
  message: string | null;
  canOptimize: boolean;
};

export function analyzePlanRoutes(plan: TripPlanWithDays): DayRouteInsight[] {
  return plan.days.map((day) => {
    const enriched = enrichDay(day, plan.transportMode);
    const { totalKm, totalMin, mappedCount } = enriched.routeStats;
    const activityCount = day.activities.length;
    const maxMin = MAX_TRAVEL_MIN[plan.paceLevel];
    const overloaded = totalMin > maxMin && mappedCount >= 2;
    const canOptimize = mappedCount >= 3;

    let message: string | null = null;
    if (mappedCount < 2 && activityCount >= 2) {
      message = "Brak współrzędnych — trudno ocenić trasę (uzupełnij lokalizacje).";
    } else if (overloaded) {
      message = `Dużo dojazdów (~${formatTravelLabel(totalMin)}) — rozważ lżejszy dzień lub optymalizację kolejności.`;
    } else if (totalMin > 0 && mappedCount >= 2) {
      message = `Szacowany czas w trasie: ${formatTravelLabel(totalMin)} (~${totalKm} km).`;
    }

    return {
      dayNumber: day.dayNumber,
      planDayId: day.id,
      totalKm,
      totalMin,
      mappedCount,
      activityCount,
      overloaded,
      message,
      canOptimize,
    };
  });
}
