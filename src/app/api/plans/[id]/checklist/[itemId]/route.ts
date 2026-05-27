import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  isChecked: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, itemId } = await context.params;
  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const db = getDb();
  const item = await db.checklistItem.findFirst({
    where: { id: itemId, tripPlanId: id },
  });

  if (!item) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const updated = await db.checklistItem.update({
    where: { id: itemId },
    data: { isChecked: guarded.data.isChecked },
  });

  return NextResponse.json(updated);
}
