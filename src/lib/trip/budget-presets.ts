import type { TripWizardInput } from "@/types/trip";

/** Dzienne widełki całej ekipy (orientacyjnie, PLN) */
const DAILY_GROUP_PLN: Record<
  TripWizardInput["budgetLevel"],
  { min: number; max: number }
> = {
  LOW: { min: 280, max: 480 },
  MEDIUM: { min: 480, max: 820 },
  HIGH: { min: 900, max: 1600 },
};

export function suggestBudgetRange(
  budgetLevel: TripWizardInput["budgetLevel"],
  daysCount: number,
  adultsCount: number,
): { totalBudgetMin: number; totalBudgetMax: number } {
  const daily = DAILY_GROUP_PLN[budgetLevel];
  const peopleFactor = Math.max(1, adultsCount * 0.85);
  const min = Math.round(daily.min * daysCount * peopleFactor);
  const max = Math.round(daily.max * daysCount * peopleFactor);
  return { totalBudgetMin: min, totalBudgetMax: max };
}
