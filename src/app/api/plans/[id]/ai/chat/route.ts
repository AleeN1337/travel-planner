import { NextResponse } from "next/server";
import { z } from "zod";
import { askPlanAssistant } from "@/lib/ai/plan-assistant";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { assertPlanAccess } from "@/lib/plans/plan-access";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 60;

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
    const reply = await askPlanAssistant(plan, guarded.data.messages);
    return NextResponse.json(reply);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd asystenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
