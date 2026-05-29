import { NextResponse } from "next/server";
import { getCollaborationBundle } from "@/lib/plans/collaboration/get-collaboration";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import {
  planParticipantCookieHeader,
  readPlanParticipantToken,
} from "@/lib/plans/plan-participant";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const data = await getCollaborationBundle(id);
  const response = NextResponse.json(data);
  const token = await readPlanParticipantToken(id);
  if (token && data.member.name) {
    response.headers.append(
      "Set-Cookie",
      planParticipantCookieHeader(id, token),
    );
  }
  return response;
}
