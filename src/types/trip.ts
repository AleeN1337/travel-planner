import { z } from "zod";
import {
  START_DATE_PAST_MESSAGE,
  isPastTripStartDate,
} from "@/lib/trip/start-date";

export const budgetLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const travelStyleSchema = z.enum([
  "CULTURE",
  "FOOD",
  "NATURE",
  "NIGHTLIFE",
  "FAMILY",
  "MIXED",
]);
export const paceLevelSchema = z.enum(["RELAXED", "BALANCED", "INTENSE"]);
export const transportModeSchema = z.enum([
  "WALKING",
  "PUBLIC_TRANSIT",
  "CAR",
  "MIXED",
]);

export const planVariantSchema = z.enum(["BUDGET", "STANDARD", "PREMIUM"]);

export const travelPartySchema = z.enum([
  "SOLO",
  "COUPLE",
  "FAMILY",
  "FRIENDS",
  "GROUP",
]);

export const currencySchema = z.enum(["PLN", "EUR", "USD"]);

export const budgetIncludesSchema = z.object({
  flights: z.boolean(),
  accommodation: z.boolean(),
  food: z.boolean(),
  attractions: z.boolean(),
  localTransport: z.boolean(),
});

export const foodStandardSchema = z.enum([
  "STREET_FOOD",
  "LOCAL_BISTRO",
  "RESTAURANTS",
  "FINE_DINING",
]);

export const accommodationTypeSchema = z.enum([
  "HOSTEL",
  "HOTEL_3STAR",
  "BOUTIQUE",
  "APARTMENT",
  "ALREADY_BOOKED",
]);

export const mobilityNeedsSchema = z.enum(["NONE", "LIMITED", "STROLLER"]);

export const maxTravelBetweenSchema = z.enum([
  "WALK_15",
  "OK_30",
  "UNLIMITED",
]);

export const tripOccasionSchema = z.enum([
  "VACATION",
  "BUSINESS",
  "HONEYMOON",
  "BIRTHDAY",
  "OTHER",
]);

export const weatherPreferenceSchema = z.enum([
  "ANY",
  "INDOOR_FRIENDLY",
  "OK_RAIN",
  "AVOID_HEAT",
]);

export const languageComfortSchema = z.enum([
  "POLISH_OK",
  "ENGLISH_OK",
  "NEED_EASY",
]);

export const tripWizardSchema = z
  .object({
    organizerName: z
      .string()
      .min(1, "Podaj swoje imię jako organizatora")
      .max(40),
    destination: z.string().min(2, "Podaj kierunek podróży"),
    daysCount: z.coerce.number().int().min(1).max(30),
    startDate: z.string().optional(),
    arrivalAirportCode: z.string().length(3).optional(),
    arrivalAirportName: z.string().min(1).optional(),
    departureCity: z.string().max(120).optional(),
    departureAirportCode: z.string().length(3).optional(),
    departureAirportName: z.string().min(1).optional(),
    travelParty: travelPartySchema,
    adultsCount: z.coerce.number().int().min(1).max(12).default(2),
    childrenAges: z.array(z.coerce.number().int().min(0).max(17)).optional(),
    mobilityNeeds: mobilityNeedsSchema.default("NONE"),
    firstTimeVisit: z.boolean().default(true),
    mustSee: z.string().max(500).optional(),
    avoid: z.string().max(500).optional(),
    accommodationArea: z.string().max(200).optional(),
    budgetLevel: budgetLevelSchema,
    currency: currencySchema.default("PLN"),
    totalBudgetMin: z.coerce.number().nonnegative().optional(),
    totalBudgetMax: z.coerce.number().nonnegative().optional(),
    budgetIncludes: budgetIncludesSchema,
    planVariant: planVariantSchema.default("STANDARD"),
    dietaryNotes: z.string().max(300).optional(),
    foodStandard: foodStandardSchema.default("LOCAL_BISTRO"),
    accommodationType: accommodationTypeSchema.default("HOTEL_3STAR"),
    quietEvenings: z.boolean().default(false),
    preferredStartHour: z.coerce.number().int().min(7).max(11).default(9),
    travelStyles: z.array(travelStyleSchema).min(1).max(3),
    stylePriorityNote: z.string().max(200).optional(),
    paceLevel: paceLevelSchema,
    transportMode: transportModeSchema,
    maxTravelBetween: maxTravelBetweenSchema.default("OK_30"),
    hasTransitPass: z.boolean().default(false),
    carRental: z.boolean().default(false),
    lightFirstDay: z.boolean().default(false),
    tripOccasion: tripOccasionSchema.default("VACATION"),
    weatherPreference: weatherPreferenceSchema.default("ANY"),
    languageComfort: languageComfortSchema.default("POLISH_OK"),
    safetyNotes: z.string().max(300).optional(),
    additionalNotes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.totalBudgetMin != null &&
      data.totalBudgetMax != null &&
      data.totalBudgetMin > data.totalBudgetMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Minimalny budżet nie może być większy od maksymalnego",
        path: ["totalBudgetMax"],
      });
    }
    if (data.travelStyles.includes("MIXED") && data.travelStyles.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "„Mix” wybierz osobno lub konkretne style",
        path: ["travelStyles"],
      });
    }
    if (data.startDate && isPastTripStartDate(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: START_DATE_PAST_MESSAGE,
        path: ["startDate"],
      });
    }
  });

export type TripWizardInput = z.infer<typeof tripWizardSchema>;

export const BUDGET_LABELS: Record<TripWizardInput["budgetLevel"], string> = {
  LOW: "Niski budżet",
  MEDIUM: "Średni budżet",
  HIGH: "Luksus",
};

export const STYLE_LABELS: Record<
  TripWizardInput["travelStyles"][number],
  string
> = {
  CULTURE: "Kultura i zabytki",
  FOOD: "Jedzenie i restauracje",
  NATURE: "Natura i aktywność",
  NIGHTLIFE: "Imprezy i nocne życie",
  FAMILY: "Rodzinne",
  MIXED: "Mix wszystkiego",
};

export const PACE_LABELS: Record<TripWizardInput["paceLevel"], string> = {
  RELAXED: "Spokojnie",
  BALANCED: "Zbalansowane",
  INTENSE: "Maksimum na dzień",
};

export const TRANSPORT_LABELS: Record<
  TripWizardInput["transportMode"],
  string
> = {
  WALKING: "Głównie pieszo",
  PUBLIC_TRANSIT: "Komunikacja miejska",
  CAR: "Samochód",
  MIXED: "Mix transportów",
};

export const TRAVEL_PARTY_LABELS: Record<
  TripWizardInput["travelParty"],
  string
> = {
  SOLO: "Solo",
  COUPLE: "Para",
  FAMILY: "Rodzina z dziećmi",
  FRIENDS: "Ze znajomymi",
  GROUP: "Grupa (3+ osób)",
};

export const PLAN_VARIANT_LABELS: Record<
  TripWizardInput["planVariant"],
  string
> = {
  BUDGET: "Ekonomiczny",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export const CURRENCY_LABELS: Record<TripWizardInput["currency"], string> = {
  PLN: "PLN (zł)",
  EUR: "EUR (€)",
  USD: "USD ($)",
};

export const FOOD_STANDARD_LABELS: Record<
  TripWizardInput["foodStandard"],
  string
> = {
  STREET_FOOD: "Street food i tanie lokalne",
  LOCAL_BISTRO: "Lokalne bistra i kawiarnie",
  RESTAURANTS: "Restauracje",
  FINE_DINING: "Fine dining / wyższy standard",
};

export const ACCOMMODATION_TYPE_LABELS: Record<
  TripWizardInput["accommodationType"],
  string
> = {
  HOSTEL: "Hostel / budżet",
  HOTEL_3STAR: "Hotel 3★",
  BOUTIQUE: "Boutique / design",
  APARTMENT: "Apartament",
  ALREADY_BOOKED: "Nocleg już zarezerwowany",
};

export const MOBILITY_LABELS: Record<TripWizardInput["mobilityNeeds"], string> =
  {
    NONE: "Bez ograniczeń",
    LIMITED: "Ograniczona mobilność",
    STROLLER: "Wózek / małe dzieci",
  };

export const MAX_TRAVEL_LABELS: Record<
  TripWizardInput["maxTravelBetween"],
  string
> = {
  WALK_15: "Blisko siebie (do ~15 min)",
  OK_30: "OK do ~30 min między punktami",
  UNLIMITED: "Bez limitu — mogą być dalsze przejazdy",
};

export const TRIP_OCCASION_LABELS: Record<
  TripWizardInput["tripOccasion"],
  string
> = {
  VACATION: "Wakacje / wypoczynek",
  BUSINESS: "Biznes / praca",
  HONEYMOON: "Miesiąc miodowy / para",
  BIRTHDAY: "Urodziny / okazja",
  OTHER: "Inne",
};

export const WEATHER_PREF_LABELS: Record<
  TripWizardInput["weatherPreference"],
  string
> = {
  ANY: "Dowolna pogoda",
  INDOOR_FRIENDLY: "Przy deszczu — więcej indoor",
  OK_RAIN: "Deszcz OK — plan B w zasięgu",
  AVOID_HEAT: "Unikaj upału — przerwy, cień",
};

export const LANGUAGE_LABELS: Record<TripWizardInput["languageComfort"], string> =
  {
    POLISH_OK: "Po polsku / bez bariery",
    ENGLISH_OK: "Angielski wystarczy",
    NEED_EASY: "Prosta komunikacja / turyzm masowy",
  };

export const BUDGET_INCLUDE_LABELS: Record<
  keyof TripWizardInput["budgetIncludes"],
  string
> = {
  flights: "Loty",
  accommodation: "Noclegi",
  food: "Jedzenie",
  attractions: "Bilety i atrakcje",
  localTransport: "Transport lokalny",
};

/** Główny styl zapisywany w DB (enum pojedynczy) */
export function primaryTravelStyle(
  styles: TripWizardInput["travelStyles"],
): TripWizardInput["travelStyles"][number] {
  if (styles.length === 1) return styles[0];
  if (styles.includes("MIXED")) return "MIXED";
  return styles[0];
}

export const DEFAULT_BUDGET_INCLUDES: TripWizardInput["budgetIncludes"] = {
  flights: false,
  accommodation: true,
  food: true,
  attractions: true,
  localTransport: true,
};

export const DEFAULT_WIZARD_VALUES: TripWizardInput = {
  organizerName: "",
  destination: "",
  departureCity: "",
  daysCount: 3,
  travelParty: "COUPLE",
  adultsCount: 2,
  childrenAges: [],
  mobilityNeeds: "NONE",
  firstTimeVisit: true,
  budgetLevel: "MEDIUM",
  currency: "PLN",
  budgetIncludes: DEFAULT_BUDGET_INCLUDES,
  planVariant: "STANDARD",
  foodStandard: "LOCAL_BISTRO",
  accommodationType: "HOTEL_3STAR",
  quietEvenings: false,
  preferredStartHour: 9,
  travelStyles: ["MIXED"],
  paceLevel: "BALANCED",
  transportMode: "MIXED",
  maxTravelBetween: "OK_30",
  hasTransitPass: false,
  carRental: false,
  lightFirstDay: false,
  tripOccasion: "VACATION",
  weatherPreference: "ANY",
  languageComfort: "POLISH_OK",
};
