import type { TripWizardInput } from "@/types/trip";
import {
  ACCOMMODATION_TYPE_LABELS,
  BUDGET_INCLUDE_LABELS,
  BUDGET_LABELS,
  CURRENCY_LABELS,
  FOOD_STANDARD_LABELS,
  LANGUAGE_LABELS,
  MAX_TRAVEL_LABELS,
  MOBILITY_LABELS,
  PACE_LABELS,
  PLAN_VARIANT_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
  TRIP_OCCASION_LABELS,
  WEATHER_PREF_LABELS,
  primaryTravelStyle,
} from "@/types/trip";

function budgetIncludesLine(input: TripWizardInput): string {
  const parts = (
    Object.entries(input.budgetIncludes) as [
      keyof TripWizardInput["budgetIncludes"],
      boolean,
    ][]
  )
    .filter(([, on]) => on)
    .map(([key]) => BUDGET_INCLUDE_LABELS[key]);
  return parts.length > 0 ?
      `W widełkach uwzględnij: ${parts.join(", ")}.`
    : "Widełki bez lotów i noclegów — tylko czas na miejscu.";
}

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

  const arrival =
    input.arrivalAirportCode && input.arrivalAirportName ?
      `Lotnisko przylotu: ${input.arrivalAirportName} (${input.arrivalAirportCode}).`
    : "";
  const departure =
    input.departureAirportCode && input.departureAirportName ?
      `Lotnisko wylotu: ${input.departureAirportName} (${input.departureAirportCode}).`
    : "";

  const stay =
    input.accommodationArea?.trim() ?
      `Okolica noclegu: ${input.accommodationArea.trim()}.`
    : "";

  const mustSee =
    input.mustSee?.trim() ? `Must-see: ${input.mustSee.trim()}.` : "";
  const avoid = input.avoid?.trim() ? `Unikaj: ${input.avoid.trim()}.` : "";

  const budgetWide =
    input.totalBudgetMin != null && input.totalBudgetMax != null ?
      `Widełki budżetu całkowite: ${input.totalBudgetMin}–${input.totalBudgetMax} ${input.currency}.`
    : `Poziom wydatków (orientacyjnie): ${BUDGET_LABELS[input.budgetLevel]}.`;

  const styles =
    input.travelStyles.length === 1 ?
      STYLE_LABELS[input.travelStyles[0]]
    : input.travelStyles.map((s) => STYLE_LABELS[s]).join(", ");

  const styleNote =
    input.stylePriorityNote?.trim() ?
      `Priorytet stylu: ${input.stylePriorityNote.trim()}.`
    : "";

  const diet =
    input.dietaryNotes?.trim() ?
      `Dieta / ograniczenia: ${input.dietaryNotes.trim()}.`
    : "";

  const safety =
    input.safetyNotes?.trim() ?
      `Bezpieczeństwo / preferencje: ${input.safetyNotes.trim()}.`
    : "";

  const extra =
    input.additionalNotes?.trim() ?
      `Dodatkowe uwagi: ${input.additionalNotes.trim()}.`
    : "";

  return `Kierunek: ${input.destination}
Liczba dni: ${input.daysCount}
${start}
Z kim: ${party}, ${input.adultsCount} dorosłych
${children}
Mobilność: ${MOBILITY_LABELS[input.mobilityNeeds]}
Pierwsza wizyta w tym miejscu: ${input.firstTimeVisit ? "tak" : "nie"}
${arrival}
${departure}
${stay}
${mustSee}
${avoid}
${budgetWide}
${budgetIncludesLine(input)}
Poziom budżetu (skala): ${BUDGET_LABELS[input.budgetLevel]}
Waluta kosztów w planie: ${CURRENCY_LABELS[input.currency]}
Wariant planu: ${PLAN_VARIANT_LABELS[input.planVariant ?? "STANDARD"]} — ${
    input.planVariant === "BUDGET" ?
      "tańsze opcje, darmowe atrakcje, street food, ograniczone płatne wejścia"
    : input.planVariant === "PREMIUM" ?
      "lepsze restauracje, wycieczki z przewodnikiem, wyższy standard"
    : "zbalansowany mix kosztów i komfortu"
  }
Nocleg: ${ACCOMMODATION_TYPE_LABELS[input.accommodationType]}
Jedzenie: ${FOOD_STANDARD_LABELS[input.foodStandard]}
${diet}
Godzina startu dnia (orientacyjnie): ok. ${input.preferredStartHour}:00
${input.quietEvenings ? "Wieczory spokojne — unikaj późnych klubów i głośnych miejsc po 22:00." : ""}
Style podróży (do ${input.travelStyles.length}): ${styles}
${styleNote}
Tempo: ${PACE_LABELS[input.paceLevel]}
Transport: ${TRANSPORT_LABELS[input.transportMode]}
Dystans między punktami: ${MAX_TRAVEL_LABELS[input.maxTravelBetween]}
${input.hasTransitPass ? "Ma karnet / bilet komunikacji — optymalizuj pod metro/tramwaj." : ""}
${input.carRental ? "Wynajem auta — uwzględnij parking i dojazdy." : ""}
${input.lightFirstDay ? "Pierwszy dzień lżejszy (dojazd, jet lag)." : ""}
Okazja: ${TRIP_OCCASION_LABELS[input.tripOccasion]}
Pogoda w planie: ${WEATHER_PREF_LABELS[input.weatherPreference]}
Język / komunikacja: ${LANGUAGE_LABELS[input.languageComfort]}
${safety}
${extra}
Główny styl (meta): ${STYLE_LABELS[primaryTravelStyle(input.travelStyles)]}`;
}
