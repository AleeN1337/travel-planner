import { ensureDefaultChecklist } from "@/lib/plans/default-checklist";
import { geocodeTripPlan } from "@/lib/plans/geocode-plan";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { syncWeatherForPlan } from "@/lib/weather/openweather";

export type PlanEnrichmentNeeds = {
  checklist: boolean;
  geocode: boolean;
  weather: boolean;
};

export function getPlanEnrichmentNeeds(
  plan: TripPlanWithDays,
  hasWeatherApi: boolean,
): PlanEnrichmentNeeds {
  const geocode = plan.days.some((d) =>
    d.activities.some((a) => a.latitude == null || a.longitude == null),
  );

  return {
    checklist: plan.checklistItems.length === 0,
    geocode,
    weather:
      hasWeatherApi &&
      (plan.weatherSnapshots.length === 0 ||
        plan.weatherSnapshots[0].fetchedAt.getTime() <
          Date.now() - 6 * 60 * 60 * 1000),
  };
}

export function planNeedsEnrichment(
  needs: PlanEnrichmentNeeds,
): boolean {
  return needs.checklist || needs.geocode || needs.weather;
}

/** Uzupełnia checklistę, współrzędne (mapa) i pogodę — poza ścieżką krytyczną SSR. */
export async function enrichTripPlan(planId: string): Promise<{
  checklist: boolean;
  geocoded: number;
  weather: boolean;
}> {
  await ensureDefaultChecklist(planId);

  let geocoded = 0;
  try {
    geocoded = await geocodeTripPlan(planId);
  } catch (err) {
    console.error("[enrich] geocode:", err);
  }

  let weather = false;
  try {
    weather = await syncWeatherForPlan(planId);
  } catch (err) {
    console.error("[enrich] weather:", err);
  }

  return { checklist: true, geocoded, weather };
}
