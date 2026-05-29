import { NextResponse } from "next/server";
import { z } from "zod";
import { createActivity } from "@/lib/plans/activity-actions";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  planDayId: z.string().max(64),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  locationName: z.string().max(300).optional(),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  costMin: z.number().nonnegative().optional(),
  costMax: z.number().nonnegative().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  try {
    const activity = await createActivity(id, guarded.data);
    return NextResponse.json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd tworzenia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
