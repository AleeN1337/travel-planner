import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";
import {
  ensurePlanRead,
  ensurePlanWrite,
} from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z
  .object({
    isChecked: z.boolean().optional(),
    assignedTo: z.string().max(40).nullable().optional(),
  })
  .refine((d) => d.isChecked !== undefined || d.assignedTo !== undefined, {
    message: "Brak pól do aktualizacji",
  });

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, itemId } = await context.params;
  const guarded = await guardWriteRequest(request, "api", bodySchema);
  if (!guarded.ok) return guarded.response;

  const needsWrite = guarded.data.isChecked !== undefined;
  const access = needsWrite
    ? await ensurePlanWrite(id)
    : await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const db = getDb();
  const item = await db.checklistItem.findFirst({
    where: { id: itemId, tripPlanId: id },
  });

  if (!item) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const updated = await db.checklistItem.update({
    where: { id: itemId },
    data: {
      ...(guarded.data.isChecked !== undefined && {
        isChecked: guarded.data.isChecked,
      }),
      ...(guarded.data.assignedTo !== undefined && {
        assignedTo: guarded.data.assignedTo,
      }),
    },
  });

  return NextResponse.json(updated);
}
