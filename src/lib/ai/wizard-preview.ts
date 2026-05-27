import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import { buildTripInputContext } from "@/lib/ai/trip-input-context";
import {
  wizardPreviewSchema,
  type WizardPreview,
} from "@/types/ai-responses";
import type { TripWizardInput } from "@/types/trip";
import { planNeedsChunkedGeneration } from "@/lib/ai/generate-plan-chunked";
import { getWizardLocalWarnings } from "@/lib/ai/wizard-local-warnings";

export async function previewWizardTrip(
  input: TripWizardInput,
): Promise<WizardPreview & { localWarnings: string[] }> {
  const localWarnings = getWizardLocalWarnings(input);
  const chunkedNote =
    planNeedsChunkedGeneration(input.daysCount) ?
      "Generowanie podzielone na etapy po ~7 dni."
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
            "Podsumowujesz intencję podróży przed generowaniem planu. Krótko, po polsku, bez obiecywania dokładnych cen lotów.",
        },
        {
          role: "user",
          content: `${buildTripInputContext(input)}
${chunkedNote ? `\nUwaga techniczna: ${chunkedNote}` : ""}

Zwróć:
- summary: 2–4 zdania — co użytkownik prawdopodobnie zobaczy / jak będzie wyglądał plan
- highlights: 2–5 punktów mocnych stron tego wyjazdu
- warnings: dodatkowe ostrzeżenia (np. sezon, tłok, brak lotniska) lub null`,
        },
      ],
      response_format: zodResponseFormat(wizardPreviewSchema, "preview"),
      temperature: 0.5,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Nie udało się przygotować podglądu");
    }

    const mergedWarnings = [
      ...localWarnings,
      ...(parsed.warnings ?? []),
    ];

    return {
      ...parsed,
      warnings: mergedWarnings.length > 0 ? mergedWarnings : null,
      localWarnings,
    };
  } catch (error) {
    wrapOpenAIError(error);
  }
}
