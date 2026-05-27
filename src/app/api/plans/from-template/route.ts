import { NextResponse } from "next/server";
import { z } from "zod";
import { cloneTripPlan } from "@/lib/plans/clone-plan";
import { guestPlanCookieHeader } from "@/lib/plans/guest-plan-cookie";
import { guardWriteRequest } from "@/lib/security/api-guard";

const bodySchema = z.object({
  templatePlanId: z.string().max(64),
  acceptedLegal: z.literal(true),
});

export async function POST(request: Request) {
  const guarded = await guardWriteRequest(request, "generate", bodySchema);
  if (!guarded.ok) return guarded.response;

  try {
    const clone = await cloneTripPlan(guarded.data.templatePlanId);
    const response = NextResponse.json({ id: clone.id, fromCache: true });
    if (clone.guestToken) {
      response.headers.set(
        "Set-Cookie",
        guestPlanCookieHeader(clone.guestToken),
      );
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd kopiowania";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
