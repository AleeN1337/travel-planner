import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { TripWizardInput } from "@/types/trip";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
} from "@/types/trip";
import {
  generatedPlanSchema,
  type GeneratedPlan,
} from "@/types/generated-plan";

function buildPrompt(input: TripWizardInput): string {
  const start =
    input.startDate ?
      `Data rozpoczęcia: ${input.startDate}.`
    : "Data rozpoczęcia: elastyczna.";

  return `Jesteś ekspertem od planowania podróży. Stwórz szczegółowy plan wycieczki w języku polskim.

Kierunek: ${input.destination}
Liczba dni: ${input.daysCount}
${start}
Budżet: ${BUDGET_LABELS[input.budgetLevel]}
Styl: ${STYLE_LABELS[input.travelStyle]}
Tempo: ${PACE_LABELS[input.paceLevel]}
Transport: ${TRANSPORT_LABELS[input.transportMode]}

Wymagania:
- Dokładnie ${input.daysCount} dni (dayNumber od 1 do ${input.daysCount})
- Każdy dzień: rano (MORNING), popołudnie (AFTERNOON), wieczór (EVENING) — po 1–2 aktywności na porę
- Konkretne miejsca i nazwy (restauracje, muzea, dzielnice)
- Koszty costMin/costMax w PLN, realistyczne dla budżetu
- 1–2 aktywności z isLocalTip: true (lokalne smaczki) na cały plan
- Dopasuj intensywność do tempa podróży

Checklista przed wyjazdem (6–14 pozycji):
- Konkretne rzeczy do spakowania / załatwienia (wiza, ubezpieczenie, waluta, SIM, adapter, apteczka itd.)
- Dopasuj do kierunku i obywatelstwa polskiego podróżnika
- category: np. Dokumenty, Finanse, Zdrowie, Bagaż, Inne

Plan B — dokładnie ${input.daysCount} alternatywy (po jednej na każdy dzień):
- reason: krótko (np. deszcz, zmęczenie, zamknięte muzeum)
- title + description: sensowna alternatywa na ten dzień w tym samym mieście`;
}

export async function generateTripPlan(
  input: TripWizardInput,
): Promise<GeneratedPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak OPENAI_API_KEY w pliku .env");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content:
            "Zwracasz wyłącznie poprawny JSON zgodny ze schematem planu podróży. Wszystkie teksty po polsku.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
      response_format: zodResponseFormat(generatedPlanSchema, "trip_plan"),
      temperature: 0.7,
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error("Model nie zwrócił planu — spróbuj ponownie");
    }

    return parsed;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error(
          "Brak środków na koncie OpenAI — doładuj billing na platform.openai.com",
        );
      }
      if (error.status === 401) {
        throw new Error("Nieprawidłowy OPENAI_API_KEY w pliku .env");
      }
    }
    throw error;
  }
}
