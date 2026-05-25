import type { TimeOfDay } from "@/generated/prisma/client";

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  MORNING: "Rano",
  AFTERNOON: "Popołudnie",
  EVENING: "Wieczór",
};

export const TIME_OF_DAY_ORDER: TimeOfDay[] = [
  "MORNING",
  "AFTERNOON",
  "EVENING",
];

export const PLAN_STATUS_LABELS = {
  DRAFT: "Szkic",
  GENERATING: "Generowanie…",
  READY: "Gotowy",
  FAILED: "Błąd",
} as const;
