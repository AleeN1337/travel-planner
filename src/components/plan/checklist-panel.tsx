"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ChecklistItem } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ParticipantSelect } from "@/components/ui/readable-select";
import { cn } from "@/lib/utils";

type ChecklistPanelProps = {
  planId: string;
  items: ChecklistItem[];
  readOnly?: boolean;
  participantNames?: string[];
  canAssign?: boolean;
};

export function ChecklistPanel({
  planId,
  items: initialItems,
  readOnly = false,
  participantNames = [],
  canAssign = false,
}: ChecklistPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const refineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/plans/${planId}/ai/refine-checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd AI");
    },
    onSuccess: () => {
      toast.success("Checklista zaktualizowana");
      setNotes("");
      setShowAi(false);
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  async function assign(itemId: string, assignedTo: string | null) {
    setPending(itemId);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, assignedTo } : i)),
    );
    try {
      const res = await fetch(`/api/plans/${planId}/checklist/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setItems(initialItems);
      toast.error("Nie udało się przypisać");
    } finally {
      setPending(null);
    }
  }

  async function toggle(itemId: string, isChecked: boolean) {
    setPending(itemId);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isChecked } : i)),
    );

    try {
      const res = await fetch(`/api/plans/${planId}/checklist/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setItems(initialItems);
    } finally {
      setPending(null);
    }
  }

  const byCategory = items.reduce(
    (acc, item) => {
      const cat = item.category ?? "Inne";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>,
  );

  const done = items.filter((i) => i.isChecked).length;

  return (
    <section className="glass-card rounded-2xl border-white/10 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecks className="size-5 text-primary" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">Checklista</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{items.length}
        </span>
      </div>

      {!readOnly && !showAi ?
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-1.5 border-white/15 text-xs"
          onClick={() => setShowAi(true)}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Doprecyzuj checklistę (AI)
        </Button>
      : !readOnly && showAi ?
        <div className="mt-3 space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="np. paszport UE, lecę Ryanair, nocuję w Airbnb, dziecko 3 lata"
            rows={3}
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={notes.trim().length < 3 || refineMutation.isPending}
              onClick={() => refineMutation.mutate()}
              className="gap-1.5"
            >
              {refineMutation.isPending ? "Aktualizuję…" : "Zastosuj"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15"
              onClick={() => setShowAi(false)}
            >
              Anuluj
            </Button>
          </div>
        </div>
      : null}

      <div className="mt-4 space-y-4">
        {Object.entries(byCategory).map(([category, catItems]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <ul className="space-y-1.5">
              {catItems.map((item) => (
                <li key={item.id}>
                  <label
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-2 py-2 transition-colors",
                      !readOnly && "cursor-pointer hover:bg-white/5",
                      item.isChecked && "opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      disabled={readOnly || pending === item.id}
                      onChange={(e) => toggle(item.id, e.target.checked)}
                      className="mt-0.5 size-4 rounded border-white/20 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-sm",
                          item.isChecked && "line-through",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.resourceUrl && (
                        <a
                          href={item.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-3" aria-hidden />
                          Więcej informacji
                        </a>
                      )}
                      {canAssign && participantNames.length > 0 ?
                        <div
                          className="mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ParticipantSelect
                            label="Przypisana osoba"
                            value={item.assignedTo}
                            disabled={pending === item.id}
                            participants={participantNames}
                            emptyLabel="Nie przypisano"
                            onChange={(next) => {
                              if (next !== (item.assignedTo ?? null)) {
                                void assign(item.id, next);
                              }
                            }}
                          />
                        </div>
                      : canAssign ?
                        <p className="mt-1 text-xs text-muted-foreground">
                          Dodaj uczestników (link + imię), aby przypisywać
                          zadania.
                        </p>
                      : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
