"use client";

import { useQuery } from "@tanstack/react-query";
import { useMounted } from "@/hooks/use-mounted";
import { Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_VARIANT_LABELS, type TripWizardInput } from "@/types/trip";

type WizardCacheCardProps = {
  data: TripWizardInput;
  onUseTemplate: (templatePlanId: string) => void;
  onGenerateFresh: () => void;
  loading?: boolean;
};

export function WizardCacheCard({
  data,
  onUseTemplate,
  onGenerateFresh,
  loading,
}: WizardCacheCardProps) {
  const mounted = useMounted();
  const query = useQuery({
    queryKey: ["cache-lookup", data],
    queryFn: async () => {
      const res = await fetch("/api/trip/cache-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json() as Promise<{
        hit: boolean;
        templatePlanId?: string;
        destination?: string;
        daysCount?: number;
        variant?: string;
      }>;
    },
    enabled: mounted && data.destination.trim().length >= 2,
    staleTime: 30_000,
  });

  if (!query.data?.hit || !query.data.templatePlanId) return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
        <Database className="size-4" aria-hidden />
        Znaleziono gotowy szablon
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {query.data.destination} · {query.data.daysCount} dni ·{" "}
        {query.data.variant && query.data.variant in PLAN_VARIANT_LABELS ?
          PLAN_VARIANT_LABELS[
            query.data.variant as keyof typeof PLAN_VARIANT_LABELS
          ]
        : "Standard"}
        — możesz skopiować plan w kilka sekund zamiast czekać na AI.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() => onUseTemplate(query.data.templatePlanId!)}
          className="gap-1.5"
        >
          <Database className="size-3.5" aria-hidden />
          Użyj szablonu
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onGenerateFresh}
          className="gap-1.5 border-white/15"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Wygeneruj od zera
        </Button>
      </div>
    </div>
  );
}
