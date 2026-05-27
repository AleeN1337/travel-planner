import { zodResponseFormat } from "openai/helpers/zod";
import type { TripWizardInput } from "@/types/trip";
import { getOpenAIClient, getOpenAIModel, wrapOpenAIError } from "@/lib/ai/client";
import { buildTripInputContext } from "@/lib/ai/trip-input-context";
import {
  generatedDaysChunkSchema,
  generatedPlanMetaSchema,
  type GeneratedDaysChunk,
  type GeneratedPlanMeta,
} from "@/types/ai-responses";
import type { GeneratedPlan } from "@/types/generated-plan";
import { generatedPlanSchema } from "@/types/generated-plan";
import { generateTripPlan } from "@/lib/ai/generate-plan";

export const PLAN_CHUNK_SIZE = 7;
export const LONG_PLAN_THRESHOLD = 8;

export type GenerationProgressEvent = {
  stage: string;
  percent: number;
  dayFrom?: number;
  dayTo?: number;
};

export function planNeedsChunkedGeneration(daysCount: number): boolean {
  return daysCount >= LONG_PLAN_THRESHOLD;
}

function buildDaysChunkPrompt(
  input: TripWizardInput,
  fromDay: number,
  toDay: number,
  existingDaysSummary?: string,
): string {
  const count = toDay - fromDay + 1;
  const continuity =
    existingDaysSummary ?
      `\nPoprzednie dni (kontynuacja — nie powtarzaj tych samych miejsc):\n${existingDaysSummary}\n`
    : "";

  return `${buildTripInputContext(input)}

Wygeneruj TYLKO dni od ${fromDay} do ${toDay} (łącznie ${count} dni).
${continuity}
Wymagania:
- dayNumber musi być dokładnie od ${fromDay} do ${toDay}
- Każdy dzień: rano (MORNING), popołudnie (AFTERNOON), wieczór (EVENING) — po 1–2 aktywności na porę
- Konkretne miejsca i nazwy po polsku
- Koszty costMin/costMax w PLN
- Na tym fragmencie planu: 0–1 aktywność z isLocalTip: true
- Spójność z tempem i budżetem`;
}

async function generateDaysChunk(
  input: TripWizardInput,
  fromDay: number,
  toDay: number,
  existingDaysSummary?: string,
): Promise<GeneratedDaysChunk> {
  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Zwracasz fragment planu podróży (tylko dni) jako JSON. Wszystkie teksty po polsku.",
        },
        {
          role: "user",
          content: buildDaysChunkPrompt(input, fromDay, toDay, existingDaysSummary),
        },
      ],
      response_format: zodResponseFormat(generatedDaysChunkSchema, "days_chunk"),
      temperature: 0.7,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Model nie zwrócił dni planu — spróbuj ponownie");
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}

async function generatePlanMeta(
  input: TripWizardInput,
  daysSummary: string,
): Promise<GeneratedPlanMeta> {
  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Tworzysz checklistę i alternatywy Plan B dla gotowego planu. JSON po polsku.",
        },
        {
          role: "user",
          content: `${buildTripInputContext(input)}

Plan (skrót dni):
${daysSummary}

Checklista (6–14 pozycji): dokumenty, finanse, zdrowie, bagaż — dla polskiego turysty.
Plan B: dokładnie ${input.daysCount} alternatyw (dayNumber 1..${input.daysCount}), po jednej na dzień.`,
        },
      ],
      response_format: zodResponseFormat(generatedPlanMetaSchema, "plan_meta"),
      temperature: 0.5,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Model nie zwrócił checklisty — spróbuj ponownie");
    }
    return parsed;
  } catch (error) {
    wrapOpenAIError(error);
  }
}

function summarizeDaysForContinuity(
  days: GeneratedDaysChunk["days"],
): string {
  return days
    .map(
      (d) =>
        `D${d.dayNumber}: ${d.title} — ${d.activities.map((a) => a.title).join(", ")}`,
    )
    .join("\n");
}

export async function generateTripPlanWithProgress(
  input: TripWizardInput,
  onProgress?: (event: GenerationProgressEvent) => void | Promise<void>,
): Promise<GeneratedPlan> {
  if (!planNeedsChunkedGeneration(input.daysCount)) {
    onProgress?.({ stage: "Generuję pełny plan…", percent: 20 });
    const plan = await generateTripPlan(input);
    onProgress?.({ stage: "Plan gotowy", percent: 100 });
    return plan;
  }

  const totalDays = input.daysCount;
  const chunks: { from: number; to: number }[] = [];
  for (let from = 1; from <= totalDays; from += PLAN_CHUNK_SIZE) {
    chunks.push({
      from,
      to: Math.min(from + PLAN_CHUNK_SIZE - 1, totalDays),
    });
  }

  const allDays: GeneratedDaysChunk["days"] = [];
  let countryCode: string | null = null;
  let existingSummary = "";

  const chunkWeight = 85 / chunks.length;

  for (let i = 0; i < chunks.length; i++) {
    const { from, to } = chunks[i];
    const percent = Math.round(5 + chunkWeight * i);
    await onProgress?.({
      stage: `Dni ${from}–${to} z ${totalDays}`,
      percent,
      dayFrom: from,
      dayTo: to,
    });

    const chunk = await generateDaysChunk(
      input,
      from,
      to,
      existingSummary || undefined,
    );
    if (!countryCode && chunk.countryCode) {
      countryCode = chunk.countryCode;
    }
    allDays.push(...chunk.days);
    existingSummary = summarizeDaysForContinuity(allDays);
  }

  await onProgress?.({ stage: "Checklista i plan B…", percent: 90 });
  const meta = await generatePlanMeta(input, existingSummary);

  await onProgress?.({ stage: "Plan gotowy", percent: 100 });

  const merged = {
    countryCode,
    days: allDays,
    checklist: meta.checklist,
    planBAlternatives: meta.planBAlternatives,
  };

  const validated = generatedPlanSchema.safeParse(merged);
  if (!validated.success) {
    throw new Error("Połączony plan nie przeszedł walidacji — spróbuj ponownie");
  }
  return validated.data;
}
