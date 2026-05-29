import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  label: z.string().min(1).max(120),
  amount: z.number().positive().max(1_000_000),
  paidBy: z.string().min(1).max(40),
  splitBetween: z.array(z.string().min(1).max(40)).min(1).max(20),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby dodać wydatek" },
      { status: 400 },
    );
  }

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const split = await db.costSplit.create({
    data: {
      tripPlanId: id,
      label: guarded.data.label.trim(),
      amount: guarded.data.amount,
      paidBy: guarded.data.paidBy.trim(),
      splitBetween: guarded.data.splitBetween.map((n) => n.trim()),
    },
  });

  return NextResponse.json({
    id: split.id,
    label: split.label,
    amount: split.amount,
    paidBy: split.paidBy,
    splitBetween: split.splitBetween,
    createdAt: split.createdAt.toISOString(),
  });
}
