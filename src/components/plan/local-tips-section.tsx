import { Sparkles } from "lucide-react";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";

export function LocalTipsSection({ plan }: { plan: TripPlanWithDays }) {
  const tips = plan.days.flatMap((day) =>
    day.activities
      .filter((a) => a.isLocalTip)
      .map((a) => ({ ...a, dayNumber: day.dayNumber })),
  );

  if (tips.length === 0) return null;

  return (
    <section className="glass-card rounded-2xl border-accent/20 bg-accent/5 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-accent" aria-hidden />
        <h2 className="font-heading text-lg font-semibold">Lokalne smaczki</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {tips.map((tip) => (
          <li
            key={tip.id}
            className="rounded-xl border border-accent/15 bg-white/[0.03] px-4 py-3"
          >
            <p className="text-xs font-medium text-accent">Dzień {tip.dayNumber}</p>
            <p className="mt-0.5 font-medium">{tip.title}</p>
            {tip.description && (
              <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
