"use client";

import { PlanJoinForm } from "@/components/invite/plan-join-form";

type PlanParticipantBannerProps = {
  planId: string;
  destination: string;
  onJoined: () => void;
};

/** Rezerwowy ekran dołączenia (gdy ktoś ominął stronę zaproszenia). */
export function PlanParticipantBanner({
  planId,
  destination,
  onJoined,
}: PlanParticipantBannerProps) {
  return (
    <div className="flex justify-center">
      <PlanJoinForm
        planId={planId}
        destination={destination}
        onSuccess={onJoined}
      />
    </div>
  );
}
