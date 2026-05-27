import type { TripWizardInput } from "@/types/trip";

/** Reguły bez AI — szybkie ostrzeżenia (bezpieczne dla klienta) */
export function getWizardLocalWarnings(input: TripWizardInput): string[] {
  const warnings: string[] = [];

  if (input.daysCount >= 14) {
    warnings.push(
      `Długi pobyt (${input.daysCount} dni) — plan wygenerujemy w kilku etapach, to może potrwać 1–3 minuty.`,
    );
  }
  if (input.daysCount > 21 && input.paceLevel === "INTENSE") {
    warnings.push(
      "Bardzo intensywne tempo na 3+ tygodnie może być męczące — rozważ „Zbalansowane”.",
    );
  }
  if (input.travelParty === "FAMILY" && input.paceLevel === "INTENSE") {
    warnings.push(
      "Przy rodzinie zwykle lepiej sprawdza się spokojniejsze tempo.",
    );
  }
  if (input.mobilityNeeds === "LIMITED" && input.paceLevel === "INTENSE") {
    warnings.push("Przy ograniczonej mobilności lepiej wybrać spokojniejsze tempo.");
  }
  if (
    input.totalBudgetMin != null &&
    input.totalBudgetMax != null &&
    input.totalBudgetMax / input.daysCount < 200
  ) {
    warnings.push(
      "Bardzo niski budżet dzienny — plan skupi się na darmowych atrakcjach i tańszym jedzeniu.",
    );
  }

  return warnings;
}
