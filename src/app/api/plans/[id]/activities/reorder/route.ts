import { NextResponse } from "next/server";
import { z } from "zod";
import { reorderActivities } from "@/lib/plans/activity-actions";

const bodySchema = z.object({
  moves: z.array(
    z.object({
      activityId: z.string(),
      planDayId: z.string(),
      orderIndex: z.number().int().min(0),
    }),
  ),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  try {
    await reorderActivities(id, parsed.data.moves);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd zapisu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
