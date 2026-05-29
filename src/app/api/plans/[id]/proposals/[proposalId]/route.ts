import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { approveProposal } from "@/lib/plans/collaboration/approve-proposal";
import { ensurePlanOwner } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
});

type RouteContext = { params: Promise<{ id: string; proposalId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, proposalId } = await context.params;
  const access = await ensurePlanOwner(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const proposal = await db.planProposal.findFirst({
    where: { id: proposalId, tripPlanId: id, status: "PENDING" },
  });
  if (!proposal) {
    return NextResponse.json({ error: "Nie znaleziono propozycji" }, { status: 404 });
  }

  if (guarded.data.action === "approve") {
    await approveProposal(id, proposalId);
    return NextResponse.json({ status: "APPROVED" });
  }

  await db.planProposal.update({
    where: { id: proposalId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  return NextResponse.json({ status: "REJECTED" });
}
