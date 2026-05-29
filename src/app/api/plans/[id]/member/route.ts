import { NextResponse } from "next/server";
import { z } from "zod";
import {
  planParticipantCookieHeader,
  registerPlanParticipant,
} from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit, parseJsonBody } from "@/lib/security/api-guard";

const bodySchema = z.object({
  name: z.string().min(1).max(40),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  if (access.access.role === "owner") {
    return NextResponse.json(
      { error: "Organizator podaje imię przy tworzeniu planu w kreatorze." },
      { status: 400 },
    );
  }

  const parsed = await parseJsonBody(request, bodySchema);
  if (!parsed.success) return parsed.response;

  const participant = await registerPlanParticipant(id, parsed.data.name, {
    skipCookie: true,
  });

  const response = NextResponse.json({
    token: participant.memberToken,
    name: participant.displayName,
  });
  response.headers.append(
    "Set-Cookie",
    planParticipantCookieHeader(id, participant.memberToken),
  );
  return response;
}
