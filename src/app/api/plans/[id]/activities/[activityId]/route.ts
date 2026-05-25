import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteActivity, updateActivity } from "@/lib/plans/activity-actions";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  locationName: z.string().optional(),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
  costMin: z.number().nonnegative().nullable().optional(),
  costMax: z.number().nonnegative().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string; activityId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id, activityId } = await context.params;
  const parsed = patchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  try {
    const activity = await updateActivity(id, activityId, parsed.data);
    return NextResponse.json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd aktualizacji";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, activityId } = await context.params;

  try {
    await deleteActivity(id, activityId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd usuwania";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
