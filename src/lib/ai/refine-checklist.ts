import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import { buildPlanSummaryContext } from "@/lib/ai/plan-context";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";

export const refinedChecklistSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        category: z.string().nullable(),
        resourceUrl: z.string().nullable(),
      }),
    )
    .min(4)
    .max(18),
});

export type RefinedChecklist = z.infer<typeof refinedChecklistSchema>;

export async function refineChecklistWithAI(
  plan: TripPlanWithDays,
  userNotes: string,
): Promise<RefinedChecklist> {
  const current = plan.checklistItems
    .map((i) => `- [${i.category ?? "Inne"}] ${i.label}`)
    .join("\n");

  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Doprecyzowujesz checklistę przed wyjazdem dla polskiego turysty. JSON po polsku. resourceUrl: opcjonalny link do oficjalnej strony (wizy, MSZ, przewoźnik) — tylko realne URL https, inaczej null.",
        },
        {
          role: "user",
          content: `${buildPlanSummaryContext(plan)}

Obecna checklista:
${current || "(pusta)"}

Uwagi użytkownika: ${userNotes.trim()}

Zwróć zaktualizowaną listę (usuń zbędne, dodaj brakujące). Kategorie: Dokumenty, Finanse, Zdrowie, Bagaż, Transport, Inne.`,
        },
      ],
      response_format: zodResponseFormat(refinedChecklistSchema, "checklist"),
      temperature: 0.4,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Nie udało się zaktualizować checklisty");
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}
