import { getDb } from "@/lib/db";
import type { RefinedChecklist } from "@/lib/ai/refine-checklist";

export async function replacePlanChecklist(
  planId: string,
  checklist: RefinedChecklist,
) {
  const db = getDb();
  await db.checklistItem.deleteMany({ where: { tripPlanId: planId } });
  await db.checklistItem.createMany({
    data: checklist.items.map((item, i) => ({
      tripPlanId: planId,
      label: item.label,
      category: item.category ?? undefined,
      resourceUrl: item.resourceUrl?.trim() || undefined,
      orderIndex: i,
      isChecked: false,
    })),
  });
}
