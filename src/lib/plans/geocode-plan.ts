import { getDb } from "@/lib/db";
import { geocodeDelay, geocodeLocation } from "@/lib/geo/nominatim";

export async function geocodeTripPlan(planId: string): Promise<number> {
  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        include: { activities: true },
      },
    },
  });

  if (!plan) return 0;

  const context = plan.destination;
  let geocoded = 0;

  for (const day of plan.days) {
    for (const activity of day.activities) {
      if (activity.latitude != null && activity.longitude != null) continue;

      const query = activity.locationName?.trim() || activity.title;
      await geocodeDelay();
      const point = await geocodeLocation(query, context);

      if (point) {
        await db.activity.update({
          where: { id: activity.id },
          data: {
            latitude: point.lat,
            longitude: point.lng,
          },
        });
        geocoded++;
      }
    }
  }

  return geocoded;
}
