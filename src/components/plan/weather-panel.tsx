"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { CloudRain, Loader2, Sun, Thermometer } from "lucide-react";
import { toast } from "sonner";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import type { WeatherSnapshot } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";

type WeatherPanelProps = {
  plan: TripPlanWithDays;
  hasApiKey: boolean;
};

const RAIN_CONDITIONS = new Set(["Deszcz", "Mżawka", "Burza"]);

function dayNumberForSnapshot(
  plan: TripPlanWithDays,
  snapshot: WeatherSnapshot,
): number {
  if (!plan.startDate) {
    const idx = plan.weatherSnapshots.findIndex((w) => w.id === snapshot.id);
    return idx >= 0 ? idx + 1 : 1;
  }
  const snapDay = startOfDay(snapshot.date).getTime();
  for (let d = 1; d <= plan.daysCount; d++) {
    const tripDay = startOfDay(addDays(plan.startDate, d - 1)).getTime();
    if (tripDay === snapDay) return d;
  }
  return 1;
}

export function WeatherPanel({ plan, hasApiKey }: WeatherPanelProps) {
  const router = useRouter();
  if (!plan) return null;
  const snapshots = plan.weatherSnapshots ?? [];
  const [applyingDay, setApplyingDay] = useState<number | null>(null);

  const applyMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      const res = await fetch(`/api/plans/${plan.id}/ai/apply-plan-b`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Nie udało się zastosować planu B");
      return dayNumber;
    },
    onSuccess: (dayNumber) => {
      toast.success(`Zastosowano plan B na dzień ${dayNumber}`);
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
    onSettled: () => setApplyingDay(null),
  });

  if (!hasApiKey) {
    return (
      <section className="glass-card rounded-2xl border-white/10 p-6">
        <div className="flex items-center gap-2">
          <CloudRain className="size-5 text-sky-400" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">Pogoda</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Dodaj OPENWEATHER_API_KEY w .env, aby zobaczyć prognozę.
        </p>
      </section>
    );
  }

  if (snapshots.length === 0) {
    return (
      <section className="glass-card rounded-2xl border-white/10 p-6">
        <div className="flex items-center gap-2">
          <CloudRain className="size-5 text-sky-400" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">Pogoda</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Prognoza niedostępna dla tego kierunku (max. 5 dni w API).
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl border-white/10 p-6">
      <div className="flex items-center gap-2">
        <Sun className="size-5 text-sky-400" aria-hidden />
        <h2 className="font-heading text-lg font-semibold">Pogoda</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {snapshots.map((w) => {
          const dayNumber = dayNumberForSnapshot(plan, w);
          const isRain = w.condition && RAIN_CONDITIONS.has(w.condition);
          const day = plan.days.find((d) => d.dayNumber === dayNumber);
          const hasPlanB = (day?.planBAlternatives.length ?? 0) > 0;

          return (
            <li
              key={w.id}
              className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  Dzień {dayNumber} ·{" "}
                  {format(new Date(w.date), "EEE d MMM", { locale: pl })}
                </span>
                {w.tempMin != null && w.tempMax != null && (
                  <span className="flex items-center gap-1 text-sm text-primary">
                    <Thermometer className="size-3.5" aria-hidden />
                    {Math.round(w.tempMin)}–{Math.round(w.tempMax)}°C
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{w.condition}</p>
              {w.suggestion && (
                <p className="mt-2 text-xs leading-relaxed text-sky-300/90">
                  {w.suggestion}
                </p>
              )}
              {isRain && hasPlanB && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 w-full border-sky-500/30 text-xs"
                  disabled={applyMutation.isPending}
                  onClick={() => {
                    setApplyingDay(dayNumber);
                    applyMutation.mutate(dayNumber);
                  }}
                >
                  {applyingDay === dayNumber && applyMutation.isPending ?
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Stosuję plan B…
                    </>
                  : "Zastosuj plan B na ten dzień"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
