import { addDays, startOfDay } from "date-fns";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { regeneratePlanDay } from "@/lib/ai/regenerate-day";

function weatherForDayNumber(
  plan: TripPlanWithDays,
  dayNumber: number,
): string | null {
  const snapshot = plan.weatherSnapshots[dayNumber - 1];
  if (snapshot) {
    return `${snapshot.condition ?? "Zmienna pogoda"}${snapshot.suggestion ? ` — ${snapshot.suggestion}` : ""}`;
  }

  if (plan.startDate) {
    const date = addDays(startOfDay(plan.startDate), dayNumber - 1);
    const match = plan.weatherSnapshots.find(
      (w) => startOfDay(w.date).getTime() === date.getTime(),
    );
    if (match) {
      return `${match.condition ?? ""}${match.suggestion ? ` — ${match.suggestion}` : ""}`;
    }
  }

  return null;
}

export async function applyPlanBForDay(
  plan: TripPlanWithDays,
  dayNumber: number,
) {
  const day = plan.days.find((d) => d.dayNumber === dayNumber);
  if (!day) throw new Error("Nie znaleziono dnia");

  const planB = day.planBAlternatives[0];
  if (!planB) {
    throw new Error("Brak planu B na ten dzień");
  }

  const weather = weatherForDayNumber(plan, dayNumber);
  const instruction = [
    "Zastosuj plan B zamiast obecnych aktywności (deszcz / zła pogoda / zmęczenie).",
    `Plan B: ${planB.title}.`,
    planB.description ? `Opis: ${planB.description}.` : "",
    `Powód: ${planB.reason}.`,
    weather ? `Prognoza: ${weather}` : "",
    "Zachowaj spójność z resztą wyjazdu i budżetem.",
  ]
    .filter(Boolean)
    .join(" ");

  return regeneratePlanDay(plan, dayNumber, instruction);
}
