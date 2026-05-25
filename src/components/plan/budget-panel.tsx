import { Wallet } from "lucide-react";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { computeBudgetByDay } from "@/lib/plans/plan-utils";

type BudgetPanelProps = {
  plan: TripPlanWithDays;
};

export function BudgetPanel({ plan }: BudgetPanelProps) {
  const byDay = computeBudgetByDay(plan.days);
  const hasCosts = byDay.some((d) => d.min > 0 || d.max > 0);

  if (!hasCosts && plan.totalBudgetMax == null) {
    return null;
  }

  const totalMin = plan.totalBudgetMin ?? 0;
  const totalMax = plan.totalBudgetMax ?? 0;

  return (
    <section className="glass-card rounded-2xl border-white/10 p-6">
      <div className="flex items-center gap-2">
        <Wallet className="size-5 text-primary" aria-hidden />
        <h2 className="font-heading text-lg font-semibold">Budżet podróży</h2>
      </div>

      {(totalMin > 0 || totalMax > 0) && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">Szacunek całości</p>
          <p className="font-heading text-2xl font-bold">
            {totalMin !== totalMax ?
              `${Math.round(totalMin)} – ${Math.round(totalMax)} PLN`
            : `~${Math.round(totalMax)} PLN`}
          </p>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {byDay.map((day) => {
          if (day.min === 0 && day.max === 0) return null;
          const pct =
            totalMax > 0 ? Math.min(100, Math.round((day.max / totalMax) * 100)) : 0;
          return (
            <li key={day.dayNumber} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>
                  Dzień {day.dayNumber}
                  {day.title ? ` · ${day.title}` : ""}
                </span>
                <span className="font-medium tabular-nums">
                  {day.min !== day.max ?
                    `${Math.round(day.min)}–${Math.round(day.max)} PLN`
                  : `${Math.round(day.max)} PLN`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        Kwoty są szacunkowe (bilety, jedzenie, transport lokalny).
      </p>
    </section>
  );
}
