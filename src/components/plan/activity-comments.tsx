"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { ActivityCommentDto } from "@/lib/plans/collaboration/types";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/expandable-section";

type ActivityCommentsProps = {
  planId: string;
  activityId: string;
  comments: ActivityCommentDto[];
  hasMember: boolean;
  onChanged: () => void;
};

export function ActivityComments({
  planId,
  activityId,
  comments,
  hasMember,
  onChanged,
}: ActivityCommentsProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Wpisz komentarz");
      return;
    }
    if (!hasMember) {
      toast.error("Podaj imię u góry planu");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(
        `/api/plans/${planId}/activities/${activityId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmed }),
        },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      setBody("");
      onChanged();
      toast.success("Komentarz dodany");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setSending(false);
    }
  }

  return (
    <ExpandableSection
      title="Komentarze"
      count={comments.length}
      defaultOpen={comments.length > 0}
      className="mt-3 border-0 bg-transparent"
    >
      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <p className="text-xs font-medium text-primary">{c.authorName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
        {hasMember ?
          <form onSubmit={(e) => void submit(e)} className="flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Napisz komentarz…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" disabled={sending || !body.trim()}>
              {sending ? "…" : "Wyślij"}
            </Button>
          </form>
        : <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="size-3.5" aria-hidden />
            Podaj imię u góry, aby komentować.
          </p>
        }
      </div>
    </ExpandableSection>
  );
}
