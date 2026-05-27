"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Route } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DayRouteInsight } from "@/lib/plans/day-route-analysis";

type DayRouteBadgeProps = {
  planId: string;
  insight: DayRouteInsight;
  onOptimized: () => void;
  disabled?: boolean;
};

export function DayRouteBadge({
  planId,
  insight,
  onOptimized,
  disabled,
}: DayRouteBadgeProps) {
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/plans/${planId}/optimize-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber: insight.dayNumber }),
      });
      const json = (await res.json()) as { error?: string; reordered?: number };
      if (!res.ok) throw new Error(json.error ?? "Błąd optymalizacji");
      return json;
    },
    onSuccess: (data) => {
      toast.success(
        data.reordered ?
          `Zaktualizowano kolejność (${data.reordered} punktów)`
        : "Kolejność bez zmian",
      );
      onOptimized();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!insight.message) return null;

  return (
    <div
      className={
        insight.overloaded ?
          "mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2"
        : "mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
      }
    >
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        {insight.overloaded ?
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" aria-hidden />
        : <Route className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />}
        {insight.message}
      </p>
      {insight.canOptimize && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 h-7 border-white/15 text-xs"
          disabled={disabled || optimizeMutation.isPending}
          onClick={() => optimizeMutation.mutate()}
        >
          {optimizeMutation.isPending ?
            "Optymalizuję…"
          : "Optymalizuj kolejność"}
        </Button>
      )}
    </div>
  );
}
