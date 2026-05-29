import { NextResponse } from "next/server";
import { enrichTripPlan } from "@/lib/plans/enrich-plan";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 120;

export async function POST(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const plan = await getTripPlanById(id);

  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  if (plan.status !== "READY") {
    return NextResponse.json(
      { error: "Plan nie jest gotowy" },
      { status: 409 },
    );
  }

  try {
    const result = await enrichTripPlan(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd uzupełniania";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
