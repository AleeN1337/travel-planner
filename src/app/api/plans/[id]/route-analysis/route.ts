import { NextResponse } from "next/server";
import { analyzePlanRoutes } from "@/lib/plans/day-route-analysis";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const plan = await getTripPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  return NextResponse.json({ days: analyzePlanRoutes(plan) });
}
