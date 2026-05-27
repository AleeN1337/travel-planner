import { NextResponse } from "next/server";
import { z } from "zod";
import { reorderActivities } from "@/lib/plans/activity-actions";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  moves: z
    .array(
      z.object({
        activityId: z.string().max(64),
        planDayId: z.string().max(64),
        orderIndex: z.number().int().min(0).max(500),
      }),
    )
    .max(200),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  try {
    await reorderActivities(id, guarded.data.moves);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd zapisu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
