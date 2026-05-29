import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string; alternativeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id, alternativeId } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby głosować" },
      { status: 400 },
    );
  }

  const db = getDb();
  const alt = await db.planBAlternative.findFirst({
    where: { id: alternativeId, planDay: { tripPlanId: id } },
    select: { id: true },
  });
  if (!alt) {
    return NextResponse.json({ error: "Nie znaleziono Plan B" }, { status: 404 });
  }

  await db.planBVote.upsert({
    where: {
      planBAlternativeId_memberToken: {
        planBAlternativeId: alternativeId,
        memberToken: member.token,
      },
    },
    create: {
      planBAlternativeId: alternativeId,
      memberToken: member.token,
      voterName: member.name,
    },
    update: { voterName: member.name },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id, alternativeId } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json({ error: "Brak tożsamości" }, { status: 400 });
  }

  const db = getDb();
  const alt = await db.planBAlternative.findFirst({
    where: { id: alternativeId, planDay: { tripPlanId: id } },
    select: { id: true },
  });
  if (!alt) {
    return NextResponse.json({ error: "Nie znaleziono Plan B" }, { status: 404 });
  }

  await db.planBVote.deleteMany({
    where: {
      planBAlternativeId: alternativeId,
      memberToken: member.token,
    },
  });

  return NextResponse.json({ ok: true });
}
