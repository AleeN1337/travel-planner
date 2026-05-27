import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { GeneratedPlan } from "@/types/generated-plan";
import type { RegenerateDayResult } from "@/lib/ai/regenerate-day";
import { recalculatePlanBudget } from "@/lib/plans/recalculate-budget";
import type { TripWizardInput } from "@/types/trip";
import { primaryTravelStyle } from "@/types/trip";
import { computeParamsHash } from "@/lib/plans/params-hash";
import type {
  BudgetLevel,
  PaceLevel,
  PlanStatus,
  PlanVariant,
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
      travelStyle: primaryTravelStyle(input.travelStyles) as TravelStyle,
      travelStyles: input.travelStyles,
      paceLevel: input.paceLevel as PaceLevel,
      transportMode: input.transportMode as TransportMode,
      travelParty: input.travelParty,
      adultsCount: input.adultsCount,
      mobilityNeeds: input.mobilityNeeds,
      firstTimeVisit: input.firstTimeVisit,
      childrenAges:
        input.childrenAges && input.childrenAges.length > 0 ?
          input.childrenAges
        : undefined,
      mustSee: input.mustSee?.trim() || undefined,
      avoid: input.avoid?.trim() || undefined,
      accommodationArea: input.accommodationArea?.trim() || undefined,
      arrivalAirportCode: input.arrivalAirportCode?.toUpperCase() || undefined,
      arrivalAirportName: input.arrivalAirportName?.trim() || undefined,
      departureAirportCode:
        input.departureAirportCode?.toUpperCase() || undefined,
      departureAirportName: input.departureAirportName?.trim() || undefined,
      totalBudgetMin: input.totalBudgetMin ?? undefined,
      totalBudgetMax: input.totalBudgetMax ?? undefined,
      currency: input.currency,
      budgetIncludes: input.budgetIncludes,
      dietaryNotes: input.dietaryNotes?.trim() || undefined,
      foodStandard: input.foodStandard,
      accommodationType: input.accommodationType,
      quietEvenings: input.quietEvenings,
      preferredStartHour: input.preferredStartHour,
      stylePriorityNote: input.stylePriorityNote?.trim() || undefined,
      maxTravelBetween: input.maxTravelBetween,
      hasTransitPass: input.hasTransitPass,
      carRental: input.carRental,
      lightFirstDay: input.lightFirstDay,
      tripOccasion: input.tripOccasion,
      weatherPreference: input.weatherPreference,
      languageComfort: input.languageComfort,
      safetyNotes: input.safetyNotes?.trim() || undefined,
      additionalNotes: input.additionalNotes?.trim() || undefined,
      variant: (input.planVariant ?? "STANDARD") as PlanVariant,
      paramsHash: computeParamsHash(input),
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
      generationProgress: 100,
      generationStage: "Gotowe",
    },
  });
}

export async function updateGenerationProgress(
  planId: string,
  stage: string,
  percent: number,
) {
  const db = getDb();
  return db.tripPlan.update({
    where: { id: planId },
    data: {
      generationStage: stage,
      generationProgress: Math.min(100, Math.max(0, percent)),
    },
  });
}

export async function replacePlanDay(
  planId: string,
  result: RegenerateDayResult,
) {
  const db = getDb();
  const { day, planB } = result;

  const planDay = await db.planDay.findFirst({
    where: { tripPlanId: planId, dayNumber: day.dayNumber },
  });
  if (!planDay) {
    throw new Error("Nie znaleziono dnia w planie");
  }

  await db.activity.deleteMany({ where: { planDayId: planDay.id } });
  await db.planBAlternative.deleteMany({ where: { planDayId: planDay.id } });

  await db.planDay.update({
    where: { id: planDay.id },
    data: { title: day.title, summary: day.summary },
  });

  let orderIndex = 0;
  for (const activity of day.activities) {
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

  await db.planBAlternative.create({
    data: {
      planDayId: planDay.id,
      reason: planB.reason,
      title: planB.title,
      description: planB.description ?? undefined,
    },
  });

  await recalculatePlanBudget(planId);
}

export async function markPlanFailed(planId: string, message: string) {
  const db = getDb();
  return db.tripPlan.update({
    where: { id: planId },
    data: { status: "FAILED", errorMessage: message },
  });
}
