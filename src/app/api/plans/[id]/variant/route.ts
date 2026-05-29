import { NextResponse } from "next/server";
import { z } from "zod";
import { guestPlanCookieHeader } from "@/lib/plans/guest-plan-cookie";
import { generatePlanVariantFromSource } from "@/lib/plans/generate-variant";
import { ensurePlanOwner } from "@/lib/plans/plan-access-response";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  variant: z.enum(["BUDGET", "STANDARD", "PREMIUM"]),
});

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 120;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await ensurePlanOwner(id);
  if (!access.ok) return access.response;

  const guarded = await guardWriteRequest(request, "generate", bodySchema);
  if (!guarded.ok) return guarded.response;

  try {
    const plan = await generatePlanVariantFromSource(id, guarded.data.variant);
    const response = NextResponse.json({ id: plan.id, variant: plan.variant });
    if (plan.guestToken) {
      response.headers.set(
        "Set-Cookie",
        guestPlanCookieHeader(plan.guestToken),
      );
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd wariantu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
