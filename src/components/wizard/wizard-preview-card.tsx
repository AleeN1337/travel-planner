"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMounted } from "@/hooks/use-mounted";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import type { TripWizardInput } from "@/types/trip";
import { getWizardLocalWarnings } from "@/lib/ai/wizard-local-warnings";

type WizardPreviewCardProps = {
  data: TripWizardInput;
  enabled: boolean;
};

export function WizardPreviewCard({ data, enabled }: WizardPreviewCardProps) {
  const mounted = useMounted();
  const localWarnings = getWizardLocalWarnings(data);
  const lastKey = useRef("");

  const query = useQuery({
    queryKey: ["wizard-preview", data],
    enabled:
      mounted &&
      enabled &&
      data.destination.trim().length >= 2 &&
      data.daysCount >= 1,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch("/api/trip/wizard-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as {
        summary?: string;
        highlights?: string[];
        warnings?: string[] | null;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Błąd podglądu");
      return json as {
        summary: string;
        highlights: string[];
        warnings: string[] | null;
      };
    },
  });

  const serialized = JSON.stringify(data);
  useEffect(() => {
    if (enabled && serialized !== lastKey.current) {
      lastKey.current = serialized;
    }
  }, [serialized, enabled]);

  if (!enabled) return null;

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="size-4" aria-hidden />
        Podgląd AI przed generowaniem
      </p>

      {localWarnings.length > 0 && (
        <ul className="space-y-1 text-xs text-amber-200/90">
          {localWarnings.map((w) => (
            <li key={w} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {w}
            </li>
          ))}
        </ul>
      )}

      {query.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Analizuję wyjazd…
        </p>
      )}

      {query.isError && (
        <p className="text-xs text-muted-foreground">
          Podgląd niedostępny — możesz i tak wygenerować plan.
        </p>
      )}

      {query.data && (
        <>
          <p className="text-sm leading-relaxed text-foreground/90">
            {query.data.summary}
          </p>
          {query.data.highlights.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
              {query.data.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          {query.data.warnings?.map((w) => (
            <p
              key={w}
              className="flex gap-2 text-xs text-amber-200/90"
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {w}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
