import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;
  const { id } = await context.params;
  const db = getDb();

  const plan = await db.tripPlan.findUnique({
    where: { id },
    select: {
      status: true,
      generationProgress: true,
      generationStage: true,
      errorMessage: true,
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  return NextResponse.json(plan);
}
