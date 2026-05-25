import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { GeneratedPlan } from "@/types/generated-plan";
import type { TripWizardInput } from "@/types/trip";
import type {
  BudgetLevel,
  PaceLevel,
  PlanStatus,
  TransportMode,
  TravelStyle,
} from "@/generated/prisma/client";

export async function createPlanRecord(input: TripWizardInput) {
  const db = getDb();
  return db.tripPlan.create({
    data: {
      guestToken: randomUUID(),
      destination: input.destination.trim(),
      daysCount: input.daysCount,
      startDate: input.startDate ? new Date(input.startDate) : null,
      budgetLevel: input.budgetLevel as BudgetLevel,
      travelStyle: input.travelStyle as TravelStyle,
      paceLevel: input.paceLevel as PaceLevel,
      transportMode: input.transportMode as TransportMode,
      status: "GENERATING" as PlanStatus,
    },
  });
}

export async function saveGeneratedPlan(
  planId: string,
  generated: GeneratedPlan,
) {
  const db = getDb();

  let totalMin = 0;
  let totalMax = 0;

  for (const day of generated.days) {
    const planDay = await db.planDay.create({
      data: {
        tripPlanId: planId,
        dayNumber: day.dayNumber,
        title: day.title,
        summary: day.summary,
      },
    });

    let orderIndex = 0;
    for (const activity of day.activities) {
      if (activity.costMin) totalMin += activity.costMin;
      if (activity.costMax) totalMax += activity.costMax;

      await db.activity.create({
        data: {
          planDayId: planDay.id,
          timeOfDay: activity.timeOfDay,
          orderIndex: orderIndex++,
          title: activity.title,
          description: activity.description,
          locationName: activity.locationName ?? undefined,
          durationMin: activity.durationMin ?? undefined,
          costMin: activity.costMin ?? undefined,
          costMax: activity.costMax ?? undefined,
          category: activity.category ?? undefined,
          isLocalTip: activity.isLocalTip,
        },
      });
    }
  }

  return db.tripPlan.update({
    where: { id: planId },
    data: {
      status: "READY",
      countryCode: generated.countryCode ?? undefined,
      totalBudgetMin: totalMin > 0 ? totalMin : null,
      totalBudgetMax: totalMax > 0 ? totalMax : null,
      errorMessage: null,
    },
  });
}

export async function markPlanFailed(planId: string, message: string) {
  const db = getDb();
  return db.tripPlan.update({
    where: { id: planId },
    data: { status: "FAILED", errorMessage: message },
  });
}
