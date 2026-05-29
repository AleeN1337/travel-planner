import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteActivity, updateActivity } from "@/lib/plans/activity-actions";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { enforceRateLimit, guardWriteRequest } from "@/lib/security/api-guard";

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional(),
  locationName: z.string().max(300).optional(),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
  costMin: z.number().nonnegative().nullable().optional(),
  costMax: z.number().nonnegative().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string; activityId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id, activityId } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "api", patchSchema);
  if (!guarded.ok) return guarded.response;

  try {
    const activity = await updateActivity(id, activityId, guarded.data);
    return NextResponse.json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd aktualizacji";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id, activityId } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  try {
    await deleteActivity(id, activityId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd usuwania";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
