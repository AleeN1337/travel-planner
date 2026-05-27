import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import {
  buildPlanDaysContext,
  buildPlanSummaryContext,
} from "@/lib/ai/plan-context";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  assistantReplySchema,
  type AssistantReply,
} from "@/types/ai-responses";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askPlanAssistant(
  plan: TripPlanWithDays,
  messages: AssistantMessage[],
): Promise<AssistantReply> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    throw new Error("Brak pytania");
  }

  const history = messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Użytkownik" : "Asystent"}: ${m.content}`)
    .join("\n");

  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content: `Jesteś asystentem planu podróży do ${plan.destination}. Odpowiadasz po polsku, konkretnie i pomocnie.
Możesz: doradzać zmiany dni, sugerować restauracje, optymalizować tempo, przypominać o budżecie.
Nie wymyślaj faktów prawnych (wiza) — przy niepewności powiedz, żeby sprawdzić urząd.
Gdy użytkownik chce zmienić dzień — zasugeruj użycie przycisku „Przerób ten dzień” przy danym dniu.
Pole suggestions: krótkie propozycje kolejnych pytań (max 4) lub null.`,
        },
        {
          role: "user",
          content: `Kontekst planu:
${buildPlanSummaryContext(plan)}

Szczegóły dni:
${buildPlanDaysContext(plan, { maxActivitiesPerDay: 8 })}

Historia rozmowy:
${history}`,
        },
      ],
      response_format: zodResponseFormat(assistantReplySchema, "assistant"),
      temperature: 0.55,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Asystent nie odpowiedział — spróbuj ponownie");
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}
