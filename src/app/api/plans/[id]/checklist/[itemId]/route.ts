import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  isChecked: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, itemId } = await context.params;
  const body = bodySchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const db = getDb();
  const item = await db.checklistItem.findFirst({
    where: { id: itemId, tripPlanId: id },
  });

  if (!item) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const updated = await db.checklistItem.update({
    where: { id: itemId },
    data: { isChecked: body.data.isChecked },
  });

  return NextResponse.json(updated);
}
