import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import {
  buildPlanDaysContext,
  buildPlanSummaryContext,
} from "@/lib/ai/plan-context";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  generatedDaySchema,
  generatedPlanBSchema,
} from "@/types/generated-plan";
import { z } from "zod";

const regenerateDaySchema = z.object({
  day: generatedDaySchema,
  planB: generatedPlanBSchema,
});

export type RegenerateDayResult = z.infer<typeof regenerateDaySchema>;

export async function regeneratePlanDay(
  plan: TripPlanWithDays,
  dayNumber: number,
  instruction?: string,
): Promise<RegenerateDayResult> {
  const targetDay = plan.days.find((d) => d.dayNumber === dayNumber);
  if (!targetDay) {
    throw new Error("Nie znaleziono dnia w planie");
  }

  const otherDays = plan.days.filter((d) => d.dayNumber !== dayNumber);
  const contextPlan: TripPlanWithDays = { ...plan, days: otherDays };
  const userNote =
    instruction?.trim() ?
      `\nInstrukcja użytkownika: ${instruction.trim()}`
    : "";

  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Przebudowujesz jeden dzień planu podróży. Zachowaj spójność z resztą wyjazdu. JSON po polsku.",
        },
        {
          role: "user",
          content: `${buildPlanSummaryContext(plan)}

Reszta planu:
${buildPlanDaysContext(contextPlan)}

Przebuduj DZIEŃ ${dayNumber} od zera (nowy tytuł, podsumowanie, aktywności na rano/popołudnie/wieczór).
Dodaj też nową alternatywę Plan B na ten dzień (dayNumber: ${dayNumber}).
${userNote}

Wymagania jak przy pełnym planie: konkretne miejsca, koszty PLN, 1–2 aktywności na porę dnia.`,
        },
      ],
      response_format: zodResponseFormat(regenerateDaySchema, "regenerate_day"),
      temperature: 0.65,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed || parsed.day.dayNumber !== dayNumber) {
      throw new Error("Model zwrócił nieprawidłowy dzień — spróbuj ponownie");
    }
    if (parsed.planB.dayNumber !== dayNumber) {
      parsed.planB.dayNumber = dayNumber;
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}
