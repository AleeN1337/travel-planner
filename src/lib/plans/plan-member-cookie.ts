/**
 * Kompatybilność wsteczna — preferuj `@/lib/plans/plan-participant`.
 */
export {
  listPlanParticipants,
  planParticipantCookieHeader,
  planParticipantCookieName,
  readPlanParticipantToken,
  registerOwnerParticipant,
  registerPlanParticipant,
  requirePlanMember,
  resolvePlanMember,
  setPlanParticipantCookie,
  syncOwnerParticipant,
  touchParticipant,
} from "./plan-participant";

export async function readPlanMemberToken(planId: string) {
  const { readPlanParticipantToken } = await import("./plan-participant");
  return readPlanParticipantToken(planId);
}

export async function readPlanMemberName(planId: string) {
  const { resolvePlanMember } = await import("./plan-participant");
  const member = await resolvePlanMember(planId);
  return member?.name;
}

export async function ensurePlanMember(name: string, planId: string) {
  const { registerPlanParticipant } = await import("./plan-participant");
  const row = await registerPlanParticipant(planId, name);
  return { token: row.memberToken, name: row.displayName };
}
