export const GUEST_PLAN_COOKIE = "guest_plan_token";

export function guestPlanCookieHeader(guestToken: string): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${GUEST_PLAN_COOKIE}=${guestToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
}
