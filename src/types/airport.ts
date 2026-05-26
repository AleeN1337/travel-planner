import { z } from "zod";

export const suggestedAirportSchema = z.object({
  iataCode: z.string().min(3).max(3),
  name: z.string().min(1),
  distanceHint: z.string().nullable(),
  isPrimary: z.boolean(),
});

export const airportsSuggestionSchema = z.object({
  destination: z.string().min(1),
  airports: z.array(suggestedAirportSchema).min(1).max(8),
});

export type SuggestedAirport = z.infer<typeof suggestedAirportSchema>;
export type AirportsSuggestion = z.infer<typeof airportsSuggestionSchema>;
