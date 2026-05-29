import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  airportsSuggestionSchema,
  type AirportsSuggestion,
} from "@/types/airport";

export type AirportSearchPurpose = "arrival" | "departure";

export async function suggestAirports(
  query: string,
  purpose: AirportSearchPurpose,
  tripDestination?: string,
): Promise<AirportsSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak OPENAI_API_KEY w pliku .env");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const trimmed = query.trim();

  const userPrompt =
    purpose === "departure" ?
      `Użytkownik wylatuje Z: "${trimmed}" (zwykle Polska lub okolice wylotu).
Popraw ewentualne literówki w nazwie miasta/regionu (np. Warsszawa → Warszawa, Krakuw → Kraków).
Zwróć lotniska, z których sensownie wylecieć — komercyjne, pasażerskie, prawdziwe kody IATA.`
    : `Kierunek podróży turystycznej: ${trimmed}
${tripDestination && tripDestination !== trimmed ? `Kontekst wycieczki: ${tripDestination}` : ""}

Popraw ewentualne literówki w nazwie kierunku.
Zwróć lotniska, na które typowy turysta z Polski mógłby przylecieć.`;

  const completion = await openai.chat.completions.parse({
    model,
    messages: [
      {
        role: "system",
        content:
          "Podajesz realne lotniska. Kody IATA (3 litery). Teksty po polsku. W polu destination zwróć poprawioną nazwę miejsca (po korekcie literówek).",
      },
      { role: "user", content: `${userPrompt}

- Główne lotnisko oznacz isPrimary: true
- distanceHint: krótko (np. "ok. 15 km od centrum")
- Nie wymyślaj kodów IATA`,
      },
    ],
    response_format: zodResponseFormat(airportsSuggestionSchema, "airports"),
    temperature: 0.2,
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("Nie udało się ustalić lotnisk — spróbuj ponownie");
  }

  return parsed;
}

/** @deprecated Użyj suggestAirports */
export async function suggestAirportsForDestination(
  destination: string,
): Promise<AirportsSuggestion> {
  return suggestAirports(destination, "arrival");
}
