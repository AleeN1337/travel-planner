import { startOfDay } from "date-fns";

export const START_DATE_PAST_MESSAGE =
  "Data startu nie może być w przeszłości — wybierz dziś lub później.";

/** Dziś w strefie użytkownika, format `YYYY-MM-DD` (atrybut `min` w `<input type="date">`). */
export function minStartDateForInput(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parsuje wartość z `<input type="date">` jako datę lokalną (bez przesunięcia UTC). */
export function parseTripStartDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(y, m - 1, d);
}

export function isPastTripStartDate(isoDate: string): boolean {
  const selected = startOfDay(parseTripStartDate(isoDate));
  const today = startOfDay(new Date());
  return selected < today;
}

export function isValidTripStartDate(
  isoDate: string | undefined,
): isoDate is string {
  if (!isoDate) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) && !isPastTripStartDate(isoDate);
}
