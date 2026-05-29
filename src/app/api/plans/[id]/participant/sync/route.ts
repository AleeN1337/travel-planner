import { NextResponse } from "next/server";
import {
  planParticipantCookieHeader,
  syncOwnerParticipant,
} from "@/lib/plans/plan-participant";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

/** Ustawia cookie uczestnika organizatora (gdy brak po wejściu w plan). */
export async function POST(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  if (access.access.role !== "owner") {
    return NextResponse.json({ error: "Tylko organizator" }, { status: 403 });
  }

  const participant = await syncOwnerParticipant(id);
  if (!participant) {
    return NextResponse.json(
      { error: "Brak imienia organizatora w planie" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    name: participant.displayName,
    token: participant.memberToken,
  });
  response.headers.append(
    "Set-Cookie",
    planParticipantCookieHeader(id, participant.memberToken),
  );
  return response;
}
