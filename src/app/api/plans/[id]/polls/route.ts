import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  question: z.string().min(3).max(200),
  options: z.array(z.string().min(1).max(80)).min(2).max(4),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby dodać ankietę" },
      { status: 400 },
    );
  }

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const poll = await db.planPoll.create({
    data: {
      tripPlanId: id,
      question: guarded.data.question.trim(),
      options: {
        create: guarded.data.options.map((label, orderIndex) => ({
          label: label.trim(),
          orderIndex,
        })),
      },
    },
    include: { options: { orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    createdAt: poll.createdAt.toISOString(),
    myOptionId: null,
    totalVotes: 0,
    options: poll.options.map((o) => ({
      id: o.id,
      label: o.label,
      voteCount: 0,
    })),
  });
}
