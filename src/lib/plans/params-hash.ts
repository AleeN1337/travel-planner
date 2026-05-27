import { createHash } from "crypto";
import type { TripWizardInput } from "@/types/trip";
import { primaryTravelStyle } from "@/types/trip";

/** Stabilny hash parametrów kreatora — do cache szablonów planów */
export function computeParamsHash(input: TripWizardInput): string {
  const normalized = {
    destination: input.destination.trim().toLowerCase(),
    daysCount: input.daysCount,
    startDate: input.startDate ?? null,
    arrivalAirportCode: input.arrivalAirportCode?.toUpperCase() ?? null,
    departureAirportCode: input.departureAirportCode?.toUpperCase() ?? null,
    travelParty: input.travelParty,
    adultsCount: input.adultsCount,
    childrenAges: input.childrenAges?.slice().sort((a, b) => a - b) ?? [],
    mobilityNeeds: input.mobilityNeeds,
    firstTimeVisit: input.firstTimeVisit,
    mustSee: input.mustSee?.trim() ?? null,
    avoid: input.avoid?.trim() ?? null,
    accommodationArea: input.accommodationArea?.trim() ?? null,
    budgetLevel: input.budgetLevel,
    currency: input.currency,
    totalBudgetMin: input.totalBudgetMin ?? null,
    totalBudgetMax: input.totalBudgetMax ?? null,
    budgetIncludes: input.budgetIncludes,
    travelStyles: [...input.travelStyles].sort(),
    travelStyle: primaryTravelStyle(input.travelStyles),
    stylePriorityNote: input.stylePriorityNote?.trim() ?? null,
    foodStandard: input.foodStandard,
    accommodationType: input.accommodationType,
    dietaryNotes: input.dietaryNotes?.trim() ?? null,
    quietEvenings: input.quietEvenings,
    preferredStartHour: input.preferredStartHour,
    paceLevel: input.paceLevel,
    transportMode: input.transportMode,
    maxTravelBetween: input.maxTravelBetween,
    hasTransitPass: input.hasTransitPass,
    carRental: input.carRental,
    lightFirstDay: input.lightFirstDay,
    tripOccasion: input.tripOccasion,
    weatherPreference: input.weatherPreference,
    languageComfort: input.languageComfort,
    safetyNotes: input.safetyNotes?.trim() ?? null,
    additionalNotes: input.additionalNotes?.trim() ?? null,
    planVariant: input.planVariant ?? "STANDARD",
  };

  return createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex")
    .slice(0, 32);
}
