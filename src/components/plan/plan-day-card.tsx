import { MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIME_OF_DAY_LABELS, TIME_OF_DAY_ORDER } from "@/lib/labels";
import type { PlanDay, Activity, TimeOfDay } from "@/generated/prisma/client";

type PlanDayWithActivities = PlanDay & { activities: Activity[] };

const TIME_ICONS: Record<TimeOfDay, string> = {
  MORNING: "🌅",
  AFTERNOON: "☀️",
  EVENING: "🌙",
};

export function PlanDayCard({ day }: { day: PlanDayWithActivities }) {
  const byTime = TIME_OF_DAY_ORDER.map((time) => ({
    time,
    items: day.activities.filter((a) => a.timeOfDay === time),
  })).filter((g) => g.items.length > 0);

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
              Dzień {day.dayNumber}
            </Badge>
            <CardTitle className="font-heading text-xl">{day.title}</CardTitle>
            {day.summary && (
              <CardDescription className="mt-1 text-base">
                {day.summary}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {byTime.map(({ time, items }) => (
          <div key={time}>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span aria-hidden>{TIME_ICONS[time]}</span>
              {TIME_OF_DAY_LABELS[time]}
            </h4>
            <ul className="space-y-3">
              {items.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{activity.title}</p>
                    {activity.isLocalTip && (
                      <Badge className="shrink-0 gap-1 border-accent/30 bg-accent/15 text-accent">
                        <Sparkles className="size-3" aria-hidden />
                        Lokalny tip
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {activity.locationName && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-primary" aria-hidden />
                        {activity.locationName}
                      </span>
                    )}
                    {activity.durationMin && (
                      <span>~{activity.durationMin} min</span>
                    )}
                    {(activity.costMin ?? activity.costMax) && (
                      <span>
                        {activity.costMin === activity.costMax ?
                          `${activity.costMin} PLN`
                        : `${activity.costMin ?? "?"}–${activity.costMax ?? "?"} PLN`}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
