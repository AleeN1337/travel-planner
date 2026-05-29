import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  optionId: z.string().max(64),
});

type RouteContext = { params: Promise<{ id: string; pollId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id, pollId } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby głosować" },
      { status: 400 },
    );
  }

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const poll = await db.planPoll.findFirst({
    where: { id: pollId, tripPlanId: id },
    include: { options: true },
  });
  if (!poll) {
    return NextResponse.json({ error: "Nie znaleziono ankiety" }, { status: 404 });
  }

  const option = poll.options.find((o) => o.id === guarded.data.optionId);
  if (!option) {
    return NextResponse.json({ error: "Nieprawidłowa opcja" }, { status: 400 });
  }

  await db.pollVote.upsert({
    where: {
      pollId_memberToken: { pollId, memberToken: member.token },
    },
    create: {
      pollId,
      pollOptionId: option.id,
      memberToken: member.token,
      voterName: member.name,
    },
    update: {
      pollOptionId: option.id,
      voterName: member.name,
    },
  });

  return NextResponse.json({ ok: true, optionId: option.id });
}
