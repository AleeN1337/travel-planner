import { getDb } from "@/lib/db";

export async function approveProposal(planId: string, proposalId: string) {
  const db = getDb();
  const proposal = await db.planProposal.findFirst({
    where: { id: proposalId, tripPlanId: planId, status: "PENDING" },
  });
  if (!proposal) {
    throw new Error("Nie znaleziono propozycji");
  }

  await db.$transaction(async (tx) => {
    await tx.planProposal.update({
      where: { id: proposalId },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    if (proposal.planDayId) {
      const maxOrder = await tx.activity.aggregate({
        where: { planDayId: proposal.planDayId },
        _max: { orderIndex: true },
      });
      await tx.activity.create({
        data: {
          planDayId: proposal.planDayId,
          timeOfDay: "AFTERNOON",
          orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
          title: proposal.title,
          description: proposal.description,
          locationName: proposal.locationName,
        },
      });
    }
  });
}
