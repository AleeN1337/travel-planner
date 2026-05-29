import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { planInviteCookieName } from "@/lib/plans/plan-invite-cookie";
import { resolveShareInvite } from "@/lib/plans/share-plan";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const link = await resolveShareInvite(token);

  if (!link) {
    notFound();
  }

  const response = NextResponse.redirect(
    new URL(`/zaproszenie/${token}/dolacz`, request.url),
  );

  response.cookies.set(planInviteCookieName(link.tripPlanId), link.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
