import { NextResponse } from "next/server";
import { z } from "zod";
import { createActivity } from "@/lib/plans/activity-actions";

const bodySchema = z.object({
  planDayId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  locationName: z.string().optional(),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  costMin: z.number().nonnegative().optional(),
  costMax: z.number().nonnegative().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  try {
    const activity = await createActivity(id, parsed.data);
    return NextResponse.json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd tworzenia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
