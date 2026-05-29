import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensurePlanOwner } from "@/lib/plans/plan-access-response";

type RouteContext = { params: Promise<{ id: string; splitId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, splitId } = await context.params;
  const access = await ensurePlanOwner(id);
  if (!access.ok) return access.response;

  const db = getDb();
  const row = await db.costSplit.findFirst({
    where: { id: splitId, tripPlanId: id },
  });
  if (!row) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  await db.costSplit.delete({ where: { id: splitId } });
  return NextResponse.json({ ok: true });
}
