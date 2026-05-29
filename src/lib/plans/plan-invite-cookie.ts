import { cookies } from "next/headers";

export const GUEST_PLAN_COOKIE = "guest_plan_token";

export function planInviteCookieName(planId: string): string {
  return `plan_invite_${planId}`;
}

export function guestPlanCookieHeader(guestToken: string): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${GUEST_PLAN_COOKIE}=${guestToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
}

export function planInviteCookieHeader(
  planId: string,
  shareToken: string,
): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  const name = planInviteCookieName(planId);
  return `${name}=${shareToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
}

export async function readGuestPlanToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(GUEST_PLAN_COOKIE)?.value;
}

export async function readPlanInviteToken(
  planId: string,
): Promise<string | undefined> {
  const store = await cookies();
  return store.get(planInviteCookieName(planId))?.value;
}

