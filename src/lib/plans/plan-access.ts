import { getDb } from "@/lib/db";
import type { SharePermission } from "@/generated/prisma/client";
import {
  readGuestPlanToken,
  readPlanInviteToken,
} from "@/lib/plans/plan-invite-cookie";

import {
  canWritePlan,
  type PlanAccessRole,
} from "@/lib/plans/plan-access-types";

export type { PlanAccessRole } from "@/lib/plans/plan-access-types";
export { canWritePlan } from "@/lib/plans/plan-access-types";

export type PlanAccessResult =
  | { ok: true; role: PlanAccessRole }
  | { ok: false };

export class PlanAccessError extends Error {
  constructor(message = "Brak dostępu do planu") {
    super(message);
    this.name = "PlanAccessError";
  }
}

export async function planRecordExists(planId: string): Promise<boolean> {
  const db = getDb();
  const row = await db.tripPlan.findUnique({
    where: { id: planId },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getPlanAccess(planId: string): Promise<PlanAccessResult> {
  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    select: { id: true, guestToken: true },
  });

  if (!plan) {
    return { ok: false };
  }

  const guestCookie = await readGuestPlanToken();
  if (guestCookie && plan.guestToken && guestCookie === plan.guestToken) {
    return { ok: true, role: "owner" };
  }

  const inviteToken = await readPlanInviteToken(planId);
  if (!inviteToken) {
    return { ok: false };
  }

  const link = await db.shareLink.findFirst({
    where: { tripPlanId: planId, token: inviteToken },
    select: { permission: true, expiresAt: true },
  });

  if (!link) {
    return { ok: false };
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return { ok: false };
  }

  return {
    ok: true,
    role: link.permission === "EDIT" ? "edit" : "view",
  };
}

type GrantedAccess = { ok: true; role: PlanAccessRole };

/** Wymaga dostępu do odczytu (właściciel lub zaproszenie). */
export async function assertPlanAccess(planId: string): Promise<GrantedAccess> {
  const access = await getPlanAccess(planId);
  if (!access.ok) {
    throw new PlanAccessError();
  }
  return access;
}

/** Wymaga prawa edycji (właściciel lub zaproszenie z EDIT). */
export async function assertPlanWriteAccess(
  planId: string,
): Promise<GrantedAccess> {
  const access = await assertPlanAccess(planId);
  if (!canWritePlan(access.role)) {
    throw new PlanAccessError("Ten link pozwala tylko na podgląd planu");
  }
  return access;
}

/** Tylko twórca planu (cookie gościa). */
export async function assertPlanOwner(planId: string): Promise<void> {
  const access = await getPlanAccess(planId);
  if (!access.ok || access.role !== "owner") {
    throw new PlanAccessError("Tylko twórca planu może to zrobić");
  }
}
