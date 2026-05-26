const GUEST_COOKIE = "guest_plan_token";

export function guestPlanCookieHeader(guestToken: string): string {
  return `${GUEST_COOKIE}=${guestToken}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
