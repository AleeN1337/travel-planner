import { z } from "zod";

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

export const travelPartySchema = z.enum([
  "SOLO",
  "COUPLE",
  "FAMILY",
  "FRIENDS",
  "GROUP",
]);

export const tripWizardSchema = z.object({
  destination: z.string().min(2, "Podaj kierunek podróży"),
  daysCount: z.coerce.number().int().min(1).max(30),
  startDate: z.string().optional(),
  arrivalAirportCode: z.string().length(3).optional(),
  arrivalAirportName: z.string().min(1).optional(),
  travelParty: travelPartySchema,
  childrenAges: z.array(z.coerce.number().int().min(0).max(17)).optional(),
  mustSee: z.string().max(500).optional(),
  avoid: z.string().max(500).optional(),
  accommodationArea: z.string().max(200).optional(),
  budgetLevel: budgetLevelSchema,
  travelStyle: travelStyleSchema,
  paceLevel: paceLevelSchema,
  transportMode: transportModeSchema,
});

export type TripWizardInput = z.infer<typeof tripWizardSchema>;

export const BUDGET_LABELS: Record<TripWizardInput["budgetLevel"], string> = {
  LOW: "Niski budżet",
  MEDIUM: "Średni budżet",
  HIGH: "Luksus",
};

export const STYLE_LABELS: Record<TripWizardInput["travelStyle"], string> = {
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

export const DEFAULT_WIZARD_VALUES: TripWizardInput = {
  destination: "",
  daysCount: 3,
  travelParty: "COUPLE",
  childrenAges: [],
  budgetLevel: "MEDIUM",
  travelStyle: "MIXED",
  paceLevel: "BALANCED",
  transportMode: "MIXED",
};
