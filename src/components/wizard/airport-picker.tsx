"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMounted } from "@/hooks/use-mounted";
import { Loader2, Plane } from "lucide-react";
import type { SuggestedAirport } from "@/types/airport";
import { cn } from "@/lib/utils";

type AirportPickerProps = {
  destination: string;
  selectedCode?: string;
  selectedName?: string;
  onOptionsLoaded?: (count: number) => void;
  onSelect: (airport: { code: string; name: string } | null) => void;
};

async function fetchAirports(destination: string) {
  const res = await fetch("/api/trip/airports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination }),
  });
  const json = (await res.json()) as {
    airports?: SuggestedAirport[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? "Nie udało się pobrać lotnisk");
  }
  return json.airports ?? [];
}

export function AirportPicker({
  destination,
  selectedCode,
  selectedName,
  onOptionsLoaded,
  onSelect,
}: AirportPickerProps) {
  const trimmed = destination.trim();
  const mounted = useMounted();
  const enabled = mounted && trimmed.length >= 3;

  const { data: airports, isLoading, isError, error } = useQuery({
    queryKey: ["trip-airports", trimmed],
    queryFn: () => fetchAirports(trimmed),
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const sorted = useMemo(() => {
    if (!airports) return [];
    return [...airports].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
    );
  }, [airports]);

  const onSelectRef = useRef(onSelect);
  const onOptionsLoadedRef = useRef(onOptionsLoaded);
  onSelectRef.current = onSelect;
  onOptionsLoadedRef.current = onOptionsLoaded;

  const singleAirportCode =
    sorted.length === 1 ? sorted[0]?.iataCode : undefined;

  useEffect(() => {
    onOptionsLoadedRef.current?.(enabled ? sorted.length : 0);
  }, [enabled, sorted.length]);

  useEffect(() => {
    if (!enabled) {
      if (selectedCode) {
        onSelectRef.current(null);
      }
      return;
    }
    if (singleAirportCode && selectedCode !== singleAirportCode) {
      const only = sorted[0];
      onSelectRef.current({ code: only.iataCode, name: only.name });
    }
  }, [enabled, singleAirportCode, selectedCode, sorted]);

  if (!enabled) {
    return (
      <p className="text-xs text-muted-foreground">
        Wpisz kierunek (min. 3 znaki), aby zobaczyć lotniska w okolicy.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        Szukam lotnisk w okolicy…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error instanceof Error ? error.message : "Błąd lotnisk"}
      </p>
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nie znaleziono lotnisk — możesz pominąć i przejść dalej.
      </p>
    );
  }

  if (sorted.length === 1) {
    const airport = sorted[0];
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
          <Plane className="size-3.5" aria-hidden />
          Lotnisko w tym kierunku
        </p>
        <p className="font-medium">
          {airport.name}{" "}
          <span className="font-mono text-sm text-muted-foreground">
            ({airport.iataCode})
          </span>
        </p>
        {airport.distanceHint && (
          <p className="mt-1 text-xs text-muted-foreground">
            {airport.distanceHint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Wybierz lotnisko przylotu</p>
      <div className="grid gap-2">
        {sorted.map((airport) => {
          const selected = selectedCode === airport.iataCode;
          return (
            <button
              key={airport.iataCode}
              type="button"
              onClick={() =>
                onSelect({ code: airport.iataCode, name: airport.name })
              }
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all",
                selected ?
                  "border-primary/50 bg-primary/15 shadow-sm shadow-primary/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
              )}
            >
              <span className="flex flex-wrap items-center gap-2">
                <Plane className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="font-medium">{airport.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {airport.iataCode}
                </span>
                {airport.isPrimary && (
                  <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                    główne
                  </span>
                )}
              </span>
              {airport.distanceHint && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {airport.distanceHint}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!selectedCode && (
        <p className="text-xs text-amber-400/90">
          Wybierz lotnisko, aby dopasować dojazd do centrum.
        </p>
      )}
      {selectedCode && selectedName && (
        <p className="text-xs text-muted-foreground">
          Wybrane: {selectedName} ({selectedCode})
        </p>
      )}
    </div>
  );
}
