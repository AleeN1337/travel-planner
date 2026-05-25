"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import type { ChecklistItem } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type ChecklistPanelProps = {
  planId: string;
  items: ChecklistItem[];
};

export function ChecklistPanel({ planId, items: initialItems }: ChecklistPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function toggle(itemId: string, isChecked: boolean) {
    setPending(itemId);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isChecked } : i)),
    );

    try {
      const res = await fetch(`/api/plans/${planId}/checklist/${itemId}`, {
        method: "PATCH",
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
                      "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5",
                      item.isChecked && "opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      disabled={pending === item.id}
                      onChange={(e) => toggle(item.id, e.target.checked)}
                      className="mt-0.5 size-4 rounded border-white/20 accent-primary"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        item.isChecked && "line-through",
                      )}
                    >
                      {item.label}
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
