import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
} from "@/types/trip";
import type { TripWizardInput } from "@/types/trip";

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
    `Styl: ${STYLE_LABELS[plan.travelStyle]}`,
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
  return {
    destination: plan.destination,
    daysCount: plan.daysCount,
    startDate: plan.startDate?.toISOString().slice(0, 10),
    arrivalAirportCode: plan.arrivalAirportCode ?? undefined,
    arrivalAirportName: plan.arrivalAirportName ?? undefined,
    travelParty:
      (plan.travelParty as TripWizardInput["travelParty"] | null) ?? "COUPLE",
    childrenAges: Array.isArray(plan.childrenAges) ?
        (plan.childrenAges as number[])
      : undefined,
    mustSee: plan.mustSee ?? undefined,
    avoid: plan.avoid ?? undefined,
    accommodationArea: plan.accommodationArea ?? undefined,
    budgetLevel: plan.budgetLevel,
    travelStyle: plan.travelStyle,
    paceLevel: plan.paceLevel,
    transportMode: plan.transportMode,
    planVariant: plan.variant,
  };
}
