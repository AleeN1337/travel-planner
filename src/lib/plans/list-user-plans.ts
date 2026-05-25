import { getDb } from "@/lib/db";

export async function listUserTripPlans(userId: string) {
  const db = getDb();
  return db.tripPlan.findMany({
    where: { userId, status: "READY" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      destination: true,
      daysCount: true,
      startDate: true,
      totalBudgetMin: true,
      totalBudgetMax: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
