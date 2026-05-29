import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requirePlanMember } from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  locationName: z.string().max(200).optional(),
  planDayId: z.string().max(64).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const member = await requirePlanMember(id);
  if (!member) {
    return NextResponse.json(
      { error: "Podaj imię, aby dodać propozycję" },
      { status: 400 },
    );
  }

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  if (guarded.data.planDayId) {
    const day = await db.planDay.findFirst({
      where: { id: guarded.data.planDayId, tripPlanId: id },
    });
    if (!day) {
      return NextResponse.json({ error: "Nie znaleziono dnia" }, { status: 404 });
    }
  }

  const proposal = await db.planProposal.create({
    data: {
      tripPlanId: id,
      planDayId: guarded.data.planDayId,
      title: guarded.data.title.trim(),
      description: guarded.data.description?.trim(),
      locationName: guarded.data.locationName?.trim(),
      proposedByName: member.name,
      memberToken: member.token,
    },
  });

  return NextResponse.json({
    id: proposal.id,
    planDayId: proposal.planDayId,
    title: proposal.title,
    description: proposal.description,
    locationName: proposal.locationName,
    proposedByName: proposal.proposedByName,
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    isMine: true,
  });
}
