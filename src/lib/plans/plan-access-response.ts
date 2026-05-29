import { NextResponse } from "next/server";
import {
  assertPlanAccess,
  assertPlanOwner,
  assertPlanWriteAccess,
  PlanAccessError,
} from "@/lib/plans/plan-access";
import type { PlanAccessRole } from "@/lib/plans/plan-access-types";

export function planAccessDeniedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Brak dostępu do planu. Poproś twórcę o link zapraszający." },
    { status: 403 },
  );
}

export function handlePlanAccessError(error: unknown): NextResponse | null {
  if (error instanceof PlanAccessError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}

type GrantedAccess = { ok: true; role: PlanAccessRole };

type AccessGuardResult =
  | { ok: true; access: GrantedAccess }
  | { ok: false; response: NextResponse };

async function guard(fn: () => Promise<GrantedAccess>): Promise<AccessGuardResult> {
  try {
    return { ok: true, access: await fn() };
  } catch (error) {
    return {
      ok: false,
      response: handlePlanAccessError(error) ?? planAccessDeniedResponse(),
    };
  }
}

export function ensurePlanRead(planId: string): Promise<AccessGuardResult> {
  return guard(() => assertPlanAccess(planId));
}

export function ensurePlanWrite(planId: string): Promise<AccessGuardResult> {
  return guard(() => assertPlanWriteAccess(planId));
}

export function ensurePlanOwner(planId: string): Promise<AccessGuardResult> {
  return guard(async () => {
    await assertPlanOwner(planId);
    return { ok: true, role: "owner" };
  });
}
