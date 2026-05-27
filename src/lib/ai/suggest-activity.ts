import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import {
  buildPlanDaysContext,
  buildPlanSummaryContext,
} from "@/lib/ai/plan-context";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  suggestedActivitySchema,
  type SuggestedActivity,
} from "@/types/ai-responses";
import type { TimeOfDay } from "@/generated/prisma/client";
import { TIME_OF_DAY_LABELS } from "@/lib/labels";

export async function suggestActivityForPlan(
  plan: TripPlanWithDays,
  planDayId: string,
  userPrompt: string,
  timeOfDay?: TimeOfDay,
): Promise<SuggestedActivity> {
  const day = plan.days.find((d) => d.id === planDayId);
  if (!day) {
    throw new Error("Nie znaleziono dnia w planie");
  }

  const dayContext: TripPlanWithDays = {
    ...plan,
    days: plan.days.filter((d) => d.id === planDayId),
  };

  const timeHint =
    timeOfDay ?
      `Preferowana pora: ${TIME_OF_DAY_LABELS[timeOfDay]} (${timeOfDay}).`
    : "Dobierz sensowną porę dnia (MORNING, AFTERNOON lub EVENING).";

  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Proponujesz jedną aktywność do planu podróży. JSON zgodny ze schematem aktywności. Po polsku.",
        },
        {
          role: "user",
          content: `${buildPlanSummaryContext(plan)}

Dzień ${day.dayNumber} — obecny plan:
${buildPlanDaysContext(dayContext)}

Prośba użytkownika: ${userPrompt.trim()}
${timeHint}

Nie duplikuj miejsc z tego samego dnia. Koszty realistyczne w PLN.`,
        },
      ],
      response_format: zodResponseFormat(suggestedActivitySchema, "activity"),
      temperature: 0.6,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Nie udało się zaproponować aktywności");
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}
