import { createHash } from "crypto";
import type { TripWizardInput } from "@/types/trip";

/** Stabilny hash parametrów kreatora — do cache szablonów planów */
export function computeParamsHash(input: TripWizardInput): string {
  const normalized = {
    destination: input.destination.trim().toLowerCase(),
    daysCount: input.daysCount,
    startDate: input.startDate ?? null,
    arrivalAirportCode: input.arrivalAirportCode?.toUpperCase() ?? null,
    travelParty: input.travelParty,
    childrenAges: input.childrenAges?.slice().sort((a, b) => a - b) ?? [],
    mustSee: input.mustSee?.trim() ?? null,
    avoid: input.avoid?.trim() ?? null,
    accommodationArea: input.accommodationArea?.trim() ?? null,
    budgetLevel: input.budgetLevel,
    travelStyle: input.travelStyle,
    paceLevel: input.paceLevel,
    transportMode: input.transportMode,
    planVariant: input.planVariant ?? "STANDARD",
  };

  return createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex")
    .slice(0, 32);
}
