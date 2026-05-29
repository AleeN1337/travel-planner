import { getPlanAccess } from "@/lib/plans/plan-access";
import { readPlanInviteToken } from "@/lib/plans/plan-invite-cookie";
import { readPlanParticipantToken } from "@/lib/plans/plan-participant";

/** Ścieżka do wpisania imienia, gdy gość ma zaproszenie, ale brak cookie uczestnika. */
export async function getInviteJoinRedirect(
  planId: string,
): Promise<string | null> {
  const access = await getPlanAccess(planId);
  if (!access.ok || access.role === "owner") return null;

  const participantToken = await readPlanParticipantToken(planId);
  if (participantToken) return null;

  const inviteToken = await readPlanInviteToken(planId);
  if (!inviteToken) return null;

  return `/zaproszenie/${inviteToken}/dolacz`;
}
