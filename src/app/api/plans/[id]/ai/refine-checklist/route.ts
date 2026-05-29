import { NextResponse } from "next/server";
import { z } from "zod";
import { refineChecklistWithAI } from "@/lib/ai/refine-checklist";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { replacePlanChecklist } from "@/lib/plans/replace-checklist";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  notes: z.string().min(3).max(800),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "ai", bodySchema);
  if (!guarded.ok) return guarded.response;

  const plan = await getTripPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  try {
    const checklist = await refineChecklistWithAI(plan, guarded.data.notes);
    await replacePlanChecklist(id, checklist);
    return NextResponse.json({ ok: true, count: checklist.items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd checklisty";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
