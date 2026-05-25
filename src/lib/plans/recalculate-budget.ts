import { getDb } from "@/lib/db";

export async function recalculatePlanBudget(planId: string) {
  const db = getDb();
  const activities = await db.activity.findMany({
    where: { planDay: { tripPlanId: planId } },
    select: { costMin: true, costMax: true },
  });

  let totalMin = 0;
  let totalMax = 0;
  for (const a of activities) {
    if (a.costMin) totalMin += a.costMin;
    if (a.costMax) totalMax += a.costMax;
  }

  await db.tripPlan.update({
    where: { id: planId },
    data: {
      totalBudgetMin: totalMin > 0 ? totalMin : null,
      totalBudgetMax: totalMax > 0 ? totalMax : null,
    },
  });
}
