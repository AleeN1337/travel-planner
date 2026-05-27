import type { TripWizardInput } from "@/types/trip";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  PLAN_VARIANT_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
} from "@/types/trip";

/** Kontekst z kreatora — używany w promptach AI */
export function buildTripInputContext(input: TripWizardInput): string {
  const start =
    input.startDate ?
      `Data rozpoczęcia: ${input.startDate}.`
    : "Data rozpoczęcia: elastyczna.";

  const party = TRAVEL_PARTY_LABELS[input.travelParty];
  const children =
    input.travelParty === "FAMILY" && input.childrenAges?.length ?
      `Wiek dzieci: ${input.childrenAges.join(", ")} lat.`
    : "";
  const airport =
    input.arrivalAirportCode && input.arrivalAirportName ?
      `Lotnisko przylotu: ${input.arrivalAirportName} (${input.arrivalAirportCode}).`
    : "";
  const stay =
    input.accommodationArea?.trim() ?
      `Okolica noclegu: ${input.accommodationArea.trim()}.`
    : "";
  const mustSee =
    input.mustSee?.trim() ? `Must-see: ${input.mustSee.trim()}.` : "";
  const avoid = input.avoid?.trim() ? `Unikaj: ${input.avoid.trim()}.` : "";

  return `Kierunek: ${input.destination}
Liczba dni: ${input.daysCount}
${start}
Z kim: ${party}
${children}
${airport}
${stay}
${mustSee}
${avoid}
Budżet: ${BUDGET_LABELS[input.budgetLevel]}
Styl: ${STYLE_LABELS[input.travelStyle]}
Tempo: ${PACE_LABELS[input.paceLevel]}
Transport: ${TRANSPORT_LABELS[input.transportMode]}
Wariant planu: ${PLAN_VARIANT_LABELS[input.planVariant ?? "STANDARD"]} — ${
    input.planVariant === "BUDGET" ?
      "tańsze opcje, darmowe atrakcje, street food, ograniczone płatne wejścia"
    : input.planVariant === "PREMIUM" ?
      "lepsze restauracje, wycieczki z przewodnikiem, wyższy standard noclegów i transportu"
    : "zbalansowany mix kosztów i komfortu"
  }`;
}
