import { getDb } from "@/lib/db";
import { geocodeDelay, geocodeLocation } from "@/lib/geo/nominatim";

export async function geocodePlanDay(
  planId: string,
  dayNumber: number,
): Promise<number> {
  const db = getDb();
  const planDay = await db.planDay.findFirst({
    where: { tripPlanId: planId, dayNumber },
    include: {
      activities: true,
      tripPlan: { select: { destination: true } },
    },
  });

  if (!planDay) return 0;

  const context = planDay.tripPlan.destination;
  let geocoded = 0;

  for (const activity of planDay.activities) {
    if (activity.latitude != null && activity.longitude != null) continue;

    const query = activity.locationName?.trim() || activity.title;
    await geocodeDelay();
    const point = await geocodeLocation(query, context);

    if (point) {
      await db.activity.update({
        where: { id: activity.id },
        data: { latitude: point.lat, longitude: point.lng },
      });
      geocoded++;
    }
  }

  return geocoded;
}
