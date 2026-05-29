import { NextResponse } from "next/server";
import { z } from "zod";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { optimizeDayActivityOrder } from "@/lib/plans/optimize-day-order";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  dayNumber: z.number().int().positive().max(60),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const plan = await getTripPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  try {
    const result = await optimizeDayActivityOrder(plan, guarded.data.dayNumber);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd optymalizacji";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
