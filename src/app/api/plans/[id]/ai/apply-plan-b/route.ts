import { NextResponse } from "next/server";
import { z } from "zod";
import { applyPlanBForDay } from "@/lib/ai/apply-plan-b";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { geocodePlanDay } from "@/lib/plans/geocode-day";
import { replacePlanDay } from "@/lib/plans/persist-plan";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  dayNumber: z.number().int().positive().max(60),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 90;

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
    const result = await applyPlanBForDay(plan, guarded.data.dayNumber);
    await replacePlanDay(id, result);
    try {
      await geocodePlanDay(id, guarded.data.dayNumber);
    } catch {
      /* optional */
    }
    return NextResponse.json({ ok: true, dayNumber: guarded.data.dayNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd planu B";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
