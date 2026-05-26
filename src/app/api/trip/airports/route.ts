import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestAirportsForDestination } from "@/lib/ai/suggest-airports";

const bodySchema = z.object({
  destination: z.string().min(2, "Podaj kierunek (min. 2 znaki)"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
        { status: 400 },
      );
    }

    const result = await suggestAirportsForDestination(parsed.data.destination);
    const sorted = [...result.airports].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
    );

    return NextResponse.json({
      destination: result.destination,
      airports: sorted,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Błąd wyszukiwania lotnisk";
    console.error("[trip/airports]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
