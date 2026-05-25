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
        },
      },
    },
  });
}

export type TripPlanWithDays = NonNullable<
  Awaited<ReturnType<typeof getTripPlanById>>
>;
