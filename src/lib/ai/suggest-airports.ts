import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  airportsSuggestionSchema,
  type AirportsSuggestion,
} from "@/types/airport";

export async function suggestAirportsForDestination(
  destination: string,
): Promise<AirportsSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak OPENAI_API_KEY w pliku .env");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await openai.chat.completions.parse({
    model,
    messages: [
      {
        role: "system",
        content:
          "Podajesz realne lotniska obsługujące podróż do wskazanego kierunku. Kody IATA (3 litery). Teksty po polsku.",
      },
      {
        role: "user",
        content: `Kierunek podróży turystycznej: ${destination.trim()}

Zwróć wszystkie sensowne lotniska, do których typowy turysta z Polski mógłby przylecieć (komercyjne, pasażerskie).
- Główne lotnisko oznacz isPrimary: true
- distanceHint: krótko (np. "ok. 15 km od centrum", "region Costa Brava")
- Jeśli jest tylko jedno praktyczne lotnisko — zwróć jedno
- Nie wymyślaj kodów — używaj prawdziwych IATA`,
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
