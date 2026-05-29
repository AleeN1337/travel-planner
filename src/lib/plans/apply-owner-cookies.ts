import { guestPlanCookieHeader } from "@/lib/plans/guest-plan-cookie";
import {
  planParticipantCookieHeader,
  registerPlanParticipant,
} from "@/lib/plans/plan-participant";

export async function setupOwnerSession(
  planId: string,
  organizerName: string,
  guestToken?: string | null,
) {
  const participant = await registerPlanParticipant(planId, organizerName, {
    isOwner: true,
    skipCookie: true,
  });
  return { guestToken, participantToken: participant.memberToken };
}

export function appendOwnerSessionCookies(
  headers: Headers,
  planId: string,
  guestToken: string | null | undefined,
  participantToken: string,
) {
  if (guestToken) {
    headers.append("Set-Cookie", guestPlanCookieHeader(guestToken));
  }
  headers.append(
    "Set-Cookie",
    planParticipantCookieHeader(planId, participantToken),
  );
}
