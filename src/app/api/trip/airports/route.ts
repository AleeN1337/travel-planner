import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestAirports } from "@/lib/ai/suggest-airports";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  destination: z.string().min(2).max(200),
  purpose: z.enum(["arrival", "departure"]).optional(),
  tripDestination: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const guarded = await guardWriteRequest(request, "tripAi", bodySchema);
    if (!guarded.ok) return guarded.response;

    const purpose = guarded.data.purpose ?? "arrival";
    const result = await suggestAirports(
      guarded.data.destination,
      purpose,
      guarded.data.tripDestination,
    );
    const sorted = [...result.airports].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
    );

    return NextResponse.json({
      destination: result.destination,
      airports: sorted,
      purpose,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Błąd wyszukiwania lotnisk";
    console.error("[trip/airports]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
