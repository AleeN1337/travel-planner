import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const GUEST_COOKIE = "guest_plan_token";

export async function claimGuestPlansForUser(userId: string): Promise<number> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE)?.value;
  if (!token) return 0;

  const db = getDb();
  const result = await db.tripPlan.updateMany({
    where: { guestToken: token, userId: null },
    data: { userId },
  });

  cookieStore.delete(GUEST_COOKIE);
  return result.count;
}

export function guestPlanCookieHeader(guestToken: string): string {
  return `${GUEST_COOKIE}=${guestToken}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
