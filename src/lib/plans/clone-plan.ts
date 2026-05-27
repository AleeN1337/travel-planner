import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

/** Kopia gotowego planu (nowy ID, nowy token gościa) */
export async function cloneTripPlan(sourcePlanId: string) {
  const db = getDb();
  const source = await db.tripPlan.findUnique({
    where: { id: sourcePlanId, status: "READY" },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          activities: { orderBy: [{ timeOfDay: "asc" }, { orderIndex: "asc" }] },
          planBAlternatives: true,
        },
      },
      checklistItems: { orderBy: { orderIndex: "asc" } },
      weatherSnapshots: { orderBy: { date: "asc" } },
    },
  });

  if (!source) {
    throw new Error("Nie znaleziono szablonu planu");
  }

  const clone = await db.tripPlan.create({
    data: {
      guestToken: randomUUID(),
      destination: source.destination,
      countryCode: source.countryCode,
      daysCount: source.daysCount,
      startDate: source.startDate,
      budgetLevel: source.budgetLevel,
      travelStyle: source.travelStyle,
      paceLevel: source.paceLevel,
      transportMode: source.transportMode,
      travelParty: source.travelParty,
      childrenAges: source.childrenAges ?? undefined,
      mustSee: source.mustSee,
      avoid: source.avoid,
      accommodationArea: source.accommodationArea,
      arrivalAirportCode: source.arrivalAirportCode,
      arrivalAirportName: source.arrivalAirportName,
      departureAirportCode: source.departureAirportCode,
      departureAirportName: source.departureAirportName,
      adultsCount: source.adultsCount,
      mobilityNeeds: source.mobilityNeeds,
      firstTimeVisit: source.firstTimeVisit,
      travelStyles: source.travelStyles ?? undefined,
      dietaryNotes: source.dietaryNotes,
      foodStandard: source.foodStandard,
      accommodationType: source.accommodationType,
      quietEvenings: source.quietEvenings,
      preferredStartHour: source.preferredStartHour,
      stylePriorityNote: source.stylePriorityNote,
      budgetIncludes: source.budgetIncludes ?? undefined,
      maxTravelBetween: source.maxTravelBetween,
      hasTransitPass: source.hasTransitPass,
      carRental: source.carRental,
      lightFirstDay: source.lightFirstDay,
      tripOccasion: source.tripOccasion,
      weatherPreference: source.weatherPreference,
      languageComfort: source.languageComfort,
      safetyNotes: source.safetyNotes,
      additionalNotes: source.additionalNotes,
      variant: source.variant,
      totalBudgetMin: source.totalBudgetMin,
      totalBudgetMax: source.totalBudgetMax,
      currency: source.currency,
      paramsHash: source.paramsHash,
      status: "READY",
      generationProgress: 100,
      generationStage: "Skopiowano z szablonu",
    },
  });

  for (const day of source.days) {
    const newDay = await db.planDay.create({
      data: {
        tripPlanId: clone.id,
        dayNumber: day.dayNumber,
        title: day.title,
        summary: day.summary,
      },
    });

    for (const activity of day.activities) {
      await db.activity.create({
        data: {
          planDayId: newDay.id,
          timeOfDay: activity.timeOfDay,
          orderIndex: activity.orderIndex,
          title: activity.title,
          description: activity.description,
          locationName: activity.locationName,
          latitude: activity.latitude,
          longitude: activity.longitude,
          durationMin: activity.durationMin,
          costMin: activity.costMin,
          costMax: activity.costMax,
          category: activity.category,
          isLocalTip: activity.isLocalTip,
        },
      });
    }

    for (const alt of day.planBAlternatives) {
      await db.planBAlternative.create({
        data: {
          planDayId: newDay.id,
          reason: alt.reason,
          title: alt.title,
          description: alt.description,
        },
      });
    }
  }

  if (source.checklistItems.length > 0) {
    await db.checklistItem.createMany({
      data: source.checklistItems.map((item) => ({
        tripPlanId: clone.id,
        label: item.label,
        category: item.category,
        resourceUrl: item.resourceUrl,
        orderIndex: item.orderIndex,
        isChecked: false,
      })),
    });
  }

  if (source.weatherSnapshots.length > 0) {
    await db.weatherSnapshot.createMany({
      data: source.weatherSnapshots.map((w) => ({
        tripPlanId: clone.id,
        date: w.date,
        tempMin: w.tempMin,
        tempMax: w.tempMax,
        condition: w.condition,
        suggestion: w.suggestion,
      })),
    });
  }

  return clone;
}

export async function findCachedTemplate(
  paramsHash: string,
  variant: "BUDGET" | "STANDARD" | "PREMIUM",
) {
  const db = getDb();
  return db.tripPlan.findFirst({
    where: {
      paramsHash,
      variant,
      status: "READY",
      days: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      destination: true,
      daysCount: true,
      variant: true,
      createdAt: true,
    },
  });
}
