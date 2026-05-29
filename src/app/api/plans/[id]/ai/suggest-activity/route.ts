import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestActivityForPlan } from "@/lib/ai/suggest-activity";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  planDayId: z.string().max(64),
  prompt: z.string().min(3).max(500),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "ai", bodySchema);
  if (!guarded.ok) return guarded.response;

  const plan = await getTripPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  try {
    const activity = await suggestActivityForPlan(
      plan,
      guarded.data.planDayId,
      guarded.data.prompt,
      guarded.data.timeOfDay,
    );
    return NextResponse.json({ activity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
