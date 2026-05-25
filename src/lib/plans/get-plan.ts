import { getDb } from "@/lib/db";

export async function getTripPlanById(id: string) {
  const db = getDb();
  return db.tripPlan.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          activities: {
            orderBy: [{ timeOfDay: "asc" }, { orderIndex: "asc" }],
          },
          planBAlternatives: true,
        },
      },
      checklistItems: {
        orderBy: { orderIndex: "asc" },
      },
      weatherSnapshots: {
        orderBy: { date: "asc" },
      },
    },
  });
}

export type TripPlanWithDays = NonNullable<
  Awaited<ReturnType<typeof getTripPlanById>>
>;
