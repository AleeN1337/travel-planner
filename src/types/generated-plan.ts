import { z } from "zod";

/** Pola opcjonalne muszą być .nullable() — wymóg OpenAI Structured Outputs */
export const generatedActivitySchema = z.object({
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  title: z.string().min(1),
  description: z.string().min(1),
  locationName: z.string().nullable(),
  durationMin: z.number().int().positive().nullable(),
  costMin: z.number().nonnegative().nullable(),
  costMax: z.number().nonnegative().nullable(),
  category: z.string().nullable(),
  isLocalTip: z.boolean(),
});

export const generatedDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),
  activities: z.array(generatedActivitySchema).min(1),
});

export const generatedPlanSchema = z.object({
  countryCode: z.string().length(2).nullable(),
  days: z.array(generatedDaySchema).min(1),
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
