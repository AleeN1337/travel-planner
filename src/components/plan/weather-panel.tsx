import { CloudRain, Sun, Thermometer } from "lucide-react";
import type { WeatherSnapshot } from "@/generated/prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

type WeatherPanelProps = {
  snapshots: WeatherSnapshot[];
  hasApiKey: boolean;
};

export function WeatherPanel({ snapshots, hasApiKey }: WeatherPanelProps) {
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
        {snapshots.map((w) => (
          <li
            key={w.id}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
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
          </li>
        ))}
      </ul>
    </section>
  );
}
