"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMounted } from "@/hooks/use-mounted";
import { Loader2, Plane } from "lucide-react";
import type { SuggestedAirport } from "@/types/airport";
import { cn } from "@/lib/utils";

export type AirportSearchPurpose = "arrival" | "departure";

type AirportPickerProps = {
  searchQuery: string;
  purpose?: AirportSearchPurpose;
  tripDestination?: string;
  selectedCode?: string;
  selectedName?: string;
  label?: string;
  onOptionsLoaded?: (count: number) => void;
  onSelect: (airport: { code: string; name: string } | null) => void;
};

async function fetchAirports(
  searchQuery: string,
  purpose: AirportSearchPurpose,
  tripDestination?: string,
) {
  const res = await fetch("/api/trip/airports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: searchQuery,
      purpose,
      tripDestination:
        purpose === "arrival" ? tripDestination : undefined,
    }),
  });
  const json = (await res.json()) as {
    airports?: SuggestedAirport[];
    destination?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? "Nie udało się pobrać lotnisk");
  }
  return {
    airports: json.airports ?? [],
    correctedName: json.destination,
  };
}

export function AirportPicker({
  searchQuery,
  purpose = "arrival",
  tripDestination,
  selectedCode,
  selectedName,
  label,
  onOptionsLoaded,
  onSelect,
}: AirportPickerProps) {
  const trimmed = searchQuery.trim();
  const mounted = useMounted();
  const enabled = mounted && trimmed.length >= 2;

  const defaultLabel =
    purpose === "departure" ?
      "Wybierz lotnisko wylotu"
    : "Wybierz lotnisko przylotu";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["trip-airports", purpose, trimmed, tripDestination ?? ""],
    queryFn: () => fetchAirports(trimmed, purpose, tripDestination),
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const sorted = useMemo(() => {
    if (!data?.airports) return [];
    return [...data.airports].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
    );
  }, [data?.airports]);

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
        {purpose === "departure" ?
          "Wpisz miasto wylotu (min. 2 znaki), np. Warszawa — AI poprawi literówki."
        : "Wpisz kierunek (min. 2 znaki), aby zobaczyć lotniska w okolicy."}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        Szukam lotnisk (AI poprawia nazwę miejsca)…
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

  const correctedHint =
    data?.correctedName &&
    data.correctedName.toLowerCase() !== trimmed.toLowerCase() ?
      <p className="text-xs text-primary/90">
        AI rozumie lokalizację jako: <strong>{data.correctedName}</strong>
      </p>
    : null;

  if (sorted.length === 1) {
    const airport = sorted[0];
    return (
      <div className="space-y-2">
        {correctedHint}
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
            <Plane className="size-3.5" aria-hidden />
            {purpose === "departure" ? "Lotnisko wylotu" : "Lotnisko w tym kierunku"}
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
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {correctedHint}
      <p className="text-sm font-medium">{label ?? defaultLabel}</p>
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
          Wybierz lotnisko, aby dopasować trasę.
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
