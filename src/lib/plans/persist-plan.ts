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
      travelParty: input.travelParty,
      childrenAges:
        input.childrenAges && input.childrenAges.length > 0 ?
          input.childrenAges
        : undefined,
      mustSee: input.mustSee?.trim() || undefined,
      avoid: input.avoid?.trim() || undefined,
      accommodationArea: input.accommodationArea?.trim() || undefined,
      arrivalAirportCode: input.arrivalAirportCode?.toUpperCase() || undefined,
      arrivalAirportName: input.arrivalAirportName?.trim() || undefined,
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
  const dayIdByNumber = new Map<number, string>();

  for (const day of generated.days) {
    const planDay = await db.planDay.create({
      data: {
        tripPlanId: planId,
        dayNumber: day.dayNumber,
        title: day.title,
        summary: day.summary,
      },
    });
    dayIdByNumber.set(day.dayNumber, planDay.id);

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

  for (const alt of generated.planBAlternatives) {
    const planDayId = dayIdByNumber.get(alt.dayNumber);
    if (!planDayId) continue;
    await db.planBAlternative.create({
      data: {
        planDayId,
        reason: alt.reason,
        title: alt.title,
        description: alt.description ?? undefined,
      },
    });
  }

  await db.checklistItem.createMany({
    data: generated.checklist.map((item, i) => ({
      tripPlanId: planId,
      label: item.label,
      category: item.category ?? undefined,
      orderIndex: i,
    })),
  });

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
