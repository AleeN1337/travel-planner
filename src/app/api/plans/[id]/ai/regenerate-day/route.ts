import { NextResponse } from "next/server";
import { z } from "zod";
import { regeneratePlanDay } from "@/lib/ai/regenerate-day";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { assertPlanAccess } from "@/lib/plans/plan-access";
import { geocodePlanDay } from "@/lib/plans/geocode-day";
import { replacePlanDay } from "@/lib/plans/persist-plan";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  dayNumber: z.number().int().positive().max(60),
  instruction: z.string().max(500).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 90;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const guarded = await guardWriteRequest(request, "ai", bodySchema);
  if (!guarded.ok) return guarded.response;

  try {
    await assertPlanAccess(id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Brak dostępu";
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  const plan = await getTripPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Nie znaleziono planu" }, { status: 404 });
  }

  try {
    const result = await regeneratePlanDay(
      plan,
      guarded.data.dayNumber,
      guarded.data.instruction,
    );
    await replacePlanDay(id, result);
    try {
      await geocodePlanDay(id, guarded.data.dayNumber);
    } catch (geoErr) {
      console.error("[ai/regenerate-day] geocode:", geoErr);
    }
    return NextResponse.json({ ok: true, dayNumber: guarded.data.dayNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd regeneracji";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
