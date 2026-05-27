import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  BUDGET_LABELS,
  DEFAULT_BUDGET_INCLUDES,
  DEFAULT_WIZARD_VALUES,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
} from "@/types/trip";
import type { TripWizardInput } from "@/types/trip";
import { travelStyleSchema } from "@/types/trip";

function planTravelStyles(
  plan: TripPlanWithDays,
): TripWizardInput["travelStyles"] {
  if (Array.isArray(plan.travelStyles) && plan.travelStyles.length > 0) {
    const parsed = plan.travelStyles
      .map((s) => travelStyleSchema.safeParse(s))
      .filter((r) => r.success)
      .map((r) => r.data);
    if (parsed.length > 0) return parsed;
  }
  return [plan.travelStyle as TripWizardInput["travelStyles"][number]];
}

function planBudgetIncludes(
  plan: TripPlanWithDays,
): TripWizardInput["budgetIncludes"] {
  const raw = plan.budgetIncludes;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      ...DEFAULT_BUDGET_INCLUDES,
      ...(raw as TripWizardInput["budgetIncludes"]),
    };
  }
  return DEFAULT_BUDGET_INCLUDES;
}

export function buildPlanSummaryContext(plan: TripPlanWithDays): string {
  const party =
    plan.travelParty && plan.travelParty in TRAVEL_PARTY_LABELS ?
      TRAVEL_PARTY_LABELS[plan.travelParty as keyof typeof TRAVEL_PARTY_LABELS]
    : "nie podano";

  const lines = [
    `Kierunek: ${plan.destination}`,
    `Dni w planie: ${plan.daysCount}`,
    `Ekipa: ${party}`,
    plan.arrivalAirportCode ?
      `Lotnisko: ${plan.arrivalAirportName} (${plan.arrivalAirportCode})`
    : null,
    plan.mustSee ? `Must-see: ${plan.mustSee}` : null,
    plan.avoid ? `Unikaj: ${plan.avoid}` : null,
    plan.accommodationArea ? `Nocleg: ${plan.accommodationArea}` : null,
    `Budżet: ${BUDGET_LABELS[plan.budgetLevel]}`,
    `Style: ${planTravelStyles(plan)
      .map((s) => STYLE_LABELS[s])
      .join(", ")}`,
    `Tempo: ${PACE_LABELS[plan.paceLevel]}`,
    `Transport: ${TRANSPORT_LABELS[plan.transportMode]}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildPlanDaysContext(
  plan: TripPlanWithDays,
  options?: { dayNumbers?: number[]; maxActivitiesPerDay?: number },
): string {
  const dayFilter = options?.dayNumbers;
  const maxAct = options?.maxActivitiesPerDay ?? 12;

  const days = plan.days
    .filter((d) => !dayFilter || dayFilter.includes(d.dayNumber))
    .map((day) => {
      const acts = day.activities
        .slice(0, maxAct)
        .map(
          (a) =>
            `  - [${a.timeOfDay}] ${a.title}${a.locationName ? ` @ ${a.locationName}` : ""}${a.costMax ? ` (~${a.costMax} PLN)` : ""}`,
        )
        .join("\n");
      return `Dzień ${day.dayNumber}: ${day.title ?? "bez tytułu"}
${day.summary ? `Podsumowanie: ${day.summary}\n` : ""}${acts || "  (brak aktywności)"}`;
    });

  return days.join("\n\n");
}

export function planToWizardInput(plan: TripPlanWithDays): TripWizardInput {
  const defaults = DEFAULT_WIZARD_VALUES;
  return {
    destination: plan.destination,
    daysCount: plan.daysCount,
    startDate: plan.startDate?.toISOString().slice(0, 10),
    arrivalAirportCode: plan.arrivalAirportCode ?? undefined,
    arrivalAirportName: plan.arrivalAirportName ?? undefined,
    departureAirportCode: plan.departureAirportCode ?? undefined,
    departureAirportName: plan.departureAirportName ?? undefined,
    travelParty:
      (plan.travelParty as TripWizardInput["travelParty"] | null) ??
      defaults.travelParty,
    adultsCount: plan.adultsCount ?? defaults.adultsCount,
    childrenAges: Array.isArray(plan.childrenAges) ?
        (plan.childrenAges as number[])
      : undefined,
    mobilityNeeds:
      (plan.mobilityNeeds as TripWizardInput["mobilityNeeds"] | null) ??
      defaults.mobilityNeeds,
    firstTimeVisit: plan.firstTimeVisit ?? defaults.firstTimeVisit,
    mustSee: plan.mustSee ?? undefined,
    avoid: plan.avoid ?? undefined,
    accommodationArea: plan.accommodationArea ?? undefined,
    budgetLevel: plan.budgetLevel,
    currency:
      (plan.currency as TripWizardInput["currency"] | null) ?? defaults.currency,
    totalBudgetMin: plan.totalBudgetMin ?? undefined,
    totalBudgetMax: plan.totalBudgetMax ?? undefined,
    budgetIncludes: planBudgetIncludes(plan),
    planVariant: plan.variant,
    dietaryNotes: plan.dietaryNotes ?? undefined,
    foodStandard:
      (plan.foodStandard as TripWizardInput["foodStandard"] | null) ??
      defaults.foodStandard,
    accommodationType:
      (plan.accommodationType as TripWizardInput["accommodationType"] | null) ??
      defaults.accommodationType,
    quietEvenings: plan.quietEvenings ?? defaults.quietEvenings,
    preferredStartHour:
      plan.preferredStartHour ?? defaults.preferredStartHour,
    travelStyles: planTravelStyles(plan),
    stylePriorityNote: plan.stylePriorityNote ?? undefined,
    paceLevel: plan.paceLevel,
    transportMode: plan.transportMode,
    maxTravelBetween:
      (plan.maxTravelBetween as TripWizardInput["maxTravelBetween"] | null) ??
      defaults.maxTravelBetween,
    hasTransitPass: plan.hasTransitPass ?? defaults.hasTransitPass,
    carRental: plan.carRental ?? defaults.carRental,
    lightFirstDay: plan.lightFirstDay ?? defaults.lightFirstDay,
    tripOccasion:
      (plan.tripOccasion as TripWizardInput["tripOccasion"] | null) ??
      defaults.tripOccasion,
    weatherPreference:
      (plan.weatherPreference as TripWizardInput["weatherPreference"] | null) ??
      defaults.weatherPreference,
    languageComfort:
      (plan.languageComfort as TripWizardInput["languageComfort"] | null) ??
      defaults.languageComfort,
    safetyNotes: plan.safetyNotes ?? undefined,
    additionalNotes: plan.additionalNotes ?? undefined,
  };
}
