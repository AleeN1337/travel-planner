import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PlanJoinForm } from "@/components/invite/plan-join-form";
import { planInviteCookieName } from "@/lib/plans/plan-invite-cookie";
import { readPlanParticipantToken } from "@/lib/plans/plan-participant";
import { resolveShareInvite } from "@/lib/plans/share-plan";
import { cookies } from "next/headers";

type PageProps = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Dołącz do planu",
  robots: { index: false, follow: false },
};

export default async function InviteJoinPage({ params }: PageProps) {
  const { token } = await params;
  const link = await resolveShareInvite(token);
  if (!link) notFound();

  const planId = link.tripPlanId;
  const participantToken = await readPlanParticipantToken(planId);
  if (participantToken) {
    redirect(`/plan/${planId}`);
  }

  const store = await cookies();
  const inviteCookie = store.get(planInviteCookieName(planId));
  if (!inviteCookie || inviteCookie.value !== link.token) {
    store.set(planInviteCookieName(planId), link.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const destination =
    link.tripPlan.destination?.trim() || "Plan podróży";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24">
      <PlanJoinForm planId={planId} destination={destination} />
    </div>
  );
}
