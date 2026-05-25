import { getDb } from "@/lib/db";
import { geocodeLocation } from "@/lib/geo/nominatim";
import { recalculatePlanBudget } from "@/lib/plans/recalculate-budget";
import type { TimeOfDay } from "@/generated/prisma/client";

export type ActivityMove = {
  activityId: string;
  planDayId: string;
  orderIndex: number;
};

export async function reorderActivities(
  planId: string,
  moves: ActivityMove[],
) {
  const db = getDb();

  for (const move of moves) {
    const activity = await db.activity.findFirst({
      where: {
        id: move.activityId,
        planDay: { tripPlanId: planId },
      },
    });
    if (!activity) continue;

    await db.activity.update({
      where: { id: move.activityId },
      data: {
        planDayId: move.planDayId,
        orderIndex: move.orderIndex,
      },
    });
  }
}

export async function createActivity(
  planId: string,
  data: {
    planDayId: string;
    title: string;
    description?: string;
    locationName?: string;
    timeOfDay: TimeOfDay;
    costMin?: number;
    costMax?: number;
  },
) {
  const db = getDb();
  const day = await db.planDay.findFirst({
    where: { id: data.planDayId, tripPlanId: planId },
    include: { tripPlan: true },
  });
  if (!day) throw new Error("Nie znaleziono dnia planu");

  const maxOrder = await db.activity.aggregate({
    where: { planDayId: data.planDayId },
    _max: { orderIndex: true },
  });

  let latitude: number | undefined;
  let longitude: number | undefined;
  if (data.locationName?.trim()) {
    const point = await geocodeLocation(
      data.locationName,
      day.tripPlan.destination,
    );
    if (point) {
      latitude = point.lat;
      longitude = point.lng;
    }
  }

  const activity = await db.activity.create({
    data: {
      planDayId: data.planDayId,
      title: data.title.trim(),
      description: data.description?.trim(),
      locationName: data.locationName?.trim(),
      timeOfDay: data.timeOfDay,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      costMin: data.costMin,
      costMax: data.costMax,
      latitude,
      longitude,
    },
  });

  await recalculatePlanBudget(planId);
  return activity;
}

export async function updateActivity(
  planId: string,
  activityId: string,
  data: Partial<{
    title: string;
    description: string;
    locationName: string;
    timeOfDay: TimeOfDay;
    costMin: number | null;
    costMax: number | null;
  }>,
) {
  const db = getDb();
  const existing = await db.activity.findFirst({
    where: { id: activityId, planDay: { tripPlanId: planId } },
    include: { planDay: { include: { tripPlan: true } } },
  });
  if (!existing) throw new Error("Nie znaleziono aktywności");

  let latitude = existing.latitude;
  let longitude = existing.longitude;

  if (data.locationName !== undefined && data.locationName.trim()) {
    const point = await geocodeLocation(
      data.locationName,
      existing.planDay.tripPlan.destination,
    );
    if (point) {
      latitude = point.lat;
      longitude = point.lng;
    }
  }

  const activity = await db.activity.update({
    where: { id: activityId },
    data: {
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim(),
      locationName: data.locationName?.trim(),
      latitude,
      longitude,
    },
  });

  await recalculatePlanBudget(planId);
  return activity;
}

export async function deleteActivity(planId: string, activityId: string) {
  const db = getDb();
  const existing = await db.activity.findFirst({
    where: { id: activityId, planDay: { tripPlanId: planId } },
  });
  if (!existing) throw new Error("Nie znaleziono aktywności");

  await db.activity.delete({ where: { id: activityId } });
  await recalculatePlanBudget(planId);
}
