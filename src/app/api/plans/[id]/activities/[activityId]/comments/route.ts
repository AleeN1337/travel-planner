import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit, guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  body: z.string().min(1).max(1000),
});

type RouteContext = { params: Promise<{ id: string; activityId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id, activityId } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby dodać komentarz" },
      { status: 400 },
    );
  }

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const activity = await db.activity.findFirst({
    where: { id: activityId, planDay: { tripPlanId: id } },
    select: { id: true },
  });
  if (!activity) {
    return NextResponse.json({ error: "Nie znaleziono punktu" }, { status: 404 });
  }

  const comment = await db.activityComment.create({
    data: {
      activityId,
      authorName: member.name,
      memberToken: member.token,
      body: guarded.data.body.trim(),
    },
  });

  return NextResponse.json({
    id: comment.id,
    activityId: comment.activityId,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    isMine: true,
  });
}
