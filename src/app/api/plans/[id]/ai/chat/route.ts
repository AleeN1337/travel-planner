import { NextResponse } from "next/server";
import { z } from "zod";
import { askPlanAssistant } from "@/lib/ai/plan-assistant";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { ensurePlanWrite } from "@/lib/plans/plan-access-response";
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
  const access = await ensurePlanWrite(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "ai", bodySchema);
  if (!guarded.ok) return guarded.response;

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
