"use client";

import { Users } from "lucide-react";
import type { PlanParticipantDto } from "@/lib/plans/collaboration/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlanParticipantsPanelProps = {
  participants: PlanParticipantDto[];
};

export function PlanParticipantsPanel({
  participants,
}: PlanParticipantsPanelProps) {
  if (participants.length === 0) return null;

  return (
    <section className="glass-card rounded-2xl border-white/10 p-4">
      <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4 text-primary" aria-hidden />
        Uczestnicy planu
        <span className="font-normal text-muted-foreground">
          ({participants.length})
        </span>
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {participants.map((p) => (
          <li key={p.id}>
            <Badge
              variant="outline"
              className={cn(
                "border-white/15 gap-1.5 py-1",
                p.isMe && "border-primary/40 bg-primary/10",
              )}
            >
              <span>{p.displayName}</span>
              {p.isOwner && (
                <span className="text-[10px] uppercase tracking-wide text-primary">
                  organizator
                </span>
              )}
              {p.isMe && !p.isOwner && (
                <span className="text-[10px] text-muted-foreground">Ty</span>
              )}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Każda osoba z linkiem zapraszającym pojawi się tutaj po podaniu imienia.
      </p>
    </section>
  );
}
