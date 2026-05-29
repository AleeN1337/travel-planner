import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export function planParticipantCookieName(planId: string): string {
  return `plan_participant_${planId}`;
}

export function planParticipantCookieHeader(
  planId: string,
  memberToken: string,
): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  const name = planParticipantCookieName(planId);
  return `${name}=${memberToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
}

export async function readPlanParticipantToken(
  planId: string,
): Promise<string | undefined> {
  const store = await cookies();
  return store.get(planParticipantCookieName(planId))?.value;
}

export async function setPlanParticipantCookie(
  planId: string,
  memberToken: string,
): Promise<void> {
  const store = await cookies();
  store.set(planParticipantCookieName(planId), memberToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function registerPlanParticipant(
  planId: string,
  displayName: string,
  options?: { isOwner?: boolean; memberToken?: string; skipCookie?: boolean },
) {
  const db = getDb();
  const token = options?.memberToken ?? randomUUID();
  const name = displayName.trim().slice(0, 40);

  const participant = await db.planParticipant.upsert({
    where: {
      tripPlanId_memberToken: { tripPlanId: planId, memberToken: token },
    },
    create: {
      tripPlanId: planId,
      memberToken: token,
      displayName: name,
      isOwner: options?.isOwner ?? false,
    },
    update: {
      displayName: name,
      isOwner: options?.isOwner ?? undefined,
      lastSeenAt: new Date(),
    },
  });

  if (!options?.skipCookie) {
    await setPlanParticipantCookie(planId, token);
  }
  return participant;
}

/** Organizator przy tworzeniu planu — zapis w DB + cookie. */
export async function registerOwnerParticipant(
  planId: string,
  organizerName: string,
) {
  return registerPlanParticipant(planId, organizerName, { isOwner: true });
}

/** Gdy organizator wraca bez cookie uczestnika (stary plan / inna przeglądarka). */
export async function syncOwnerParticipant(planId: string) {
  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    select: { organizerName: true },
  });
  if (!plan?.organizerName?.trim()) return null;

  const existing = await db.planParticipant.findFirst({
    where: { tripPlanId: planId, isOwner: true },
  });
  if (existing) {
    await setPlanParticipantCookie(planId, existing.memberToken);
    await db.planParticipant.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date() },
    });
    return existing;
  }

  return registerOwnerParticipant(planId, plan.organizerName);
}

export async function touchParticipant(planId: string, memberToken: string) {
  const db = getDb();
  await db.planParticipant.updateMany({
    where: { tripPlanId: planId, memberToken },
    data: { lastSeenAt: new Date() },
  });
}

export async function resolvePlanMember(
  planId: string,
): Promise<{ token: string; name: string; isOwner: boolean } | null> {
  const token = await readPlanParticipantToken(planId);
  if (!token) return null;

  const db = getDb();
  const row = await db.planParticipant.findUnique({
    where: {
      tripPlanId_memberToken: { tripPlanId: planId, memberToken: token },
    },
  });
  if (!row) return null;

  await touchParticipant(planId, token);
  return {
    token: row.memberToken,
    name: row.displayName,
    isOwner: row.isOwner,
  };
}

export async function requirePlanMember(planId: string) {
  const member = await resolvePlanMember(planId);
  if (!member) return null;
  return { token: member.token, name: member.name };
}

export async function listPlanParticipants(planId: string) {
  const db = getDb();
  const currentToken = await readPlanParticipantToken(planId);
  const rows = await db.planParticipant.findMany({
    where: { tripPlanId: planId },
    orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    isOwner: r.isOwner,
    isMe: Boolean(currentToken && r.memberToken === currentToken),
    lastSeenAt: r.lastSeenAt.toISOString(),
  }));
}
