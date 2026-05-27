import { getDb } from "@/lib/db";

/** Na razie plany są dostępne po ID (jak edycja aktywności). Faza 6: token share. */
export async function assertPlanAccess(planId: string): Promise<void> {
  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    select: { id: true },
  });

  if (!plan) {
    throw new Error("Nie znaleziono planu");
  }
}
