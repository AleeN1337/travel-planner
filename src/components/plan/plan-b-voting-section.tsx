"use client";

import { CloudRain, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { PlanBAlternative } from "@/generated/prisma/client";
import type { PlanBVoteSummaryDto } from "@/lib/plans/collaboration/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanBVotingSectionProps = {
  planId: string;
  alternatives: PlanBAlternative[];
  voteSummaries: PlanBVoteSummaryDto[];
  hasMember: boolean;
  onChanged: () => void;
};

export function PlanBVotingSection({
  planId,
  alternatives,
  voteSummaries,
  hasMember,
  onChanged,
}: PlanBVotingSectionProps) {
  if (alternatives.length === 0) return null;

  const byId = new Map(voteSummaries.map((v) => [v.alternativeId, v]));

  async function toggleVote(altId: string, currentlyVoted: boolean) {
    if (!hasMember) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    try {
      const res = await fetch(
        `/api/plans/${planId}/plan-b/${altId}/vote`,
        { method: currentlyVoted ? "DELETE" : "POST", credentials: "include" },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd głosu");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
        <CloudRain className="size-4" aria-hidden />
        Plan B — głosowanie grupy
      </div>
      <ul className="mt-3 space-y-3">
        {alternatives.map((alt) => {
          const summary = byId.get(alt.id);
          const count = summary?.voteCount ?? 0;
          const iVoted = summary?.iVoted ?? false;
          return (
            <li
              key={alt.id}
              className={cn(
                "rounded-lg border border-white/10 p-3",
                iVoted && "border-sky-400/40 bg-sky-500/10",
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {alt.reason}
              </p>
              <p className="mt-0.5 font-medium">{alt.title}</p>
              {alt.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {alt.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={iVoted ? "default" : "outline"}
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => void toggleVote(alt.id, iVoted)}
                >
                  <ThumbsUp className="size-3" aria-hidden />
                  {iVoted ? "Twój głos" : "Głosuj"} ({count})
                </Button>
                {summary && summary.voterNames.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {summary.voterNames.join(", ")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
