import { ArrowDown, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TIME_OF_DAY_LABELS } from "@/lib/labels";
import type { DayWithRoute } from "@/lib/plans/plan-utils";
import { travelToNext } from "@/lib/plans/plan-utils";
import type { TransportMode } from "@/generated/prisma/client";

const TIME_ICONS = {
  MORNING: "🌅",
  AFTERNOON: "☀️",
  EVENING: "🌙",
} as const;

type PlanDayCardProps = {
  day: DayWithRoute;
  transport: TransportMode;
};

export function PlanDayCard({ day, transport }: PlanDayCardProps) {
  return (
    <Card className="glass-card overflow-hidden border-white/10">
      <CardHeader className="border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
          {day.routeStats.mappedCount > 1 && (
            <p className="text-xs text-muted-foreground">
              ~{day.routeStats.totalKm} km · ~{day.routeStats.totalMin} min dojazdu
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-0 pt-6">
        {day.activities.map((activity, index) => {
          const next = day.activities[index + 1];
          const leg = next ? travelToNext(activity, next, transport) : null;
          const showTimeHeader =
            index === 0 ||
            activity.timeOfDay !== day.activities[index - 1].timeOfDay;

          return (
            <div key={activity.id}>
              {showTimeHeader && (
                <h4 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground first:mt-0">
                  <span aria-hidden>{TIME_ICONS[activity.timeOfDay]}</span>
                  {TIME_OF_DAY_LABELS[activity.timeOfDay]}
                </h4>
              )}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">
                    <span className="mr-2 font-mono text-xs text-primary">
                      {index + 1}.
                    </span>
                    {activity.title}
                  </p>
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
                  {activity.coords && (
                    <span className="text-primary/80">na mapie</span>
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
              </div>
              {leg && (
                <div className="flex items-center gap-2 py-2 pl-4 text-xs text-muted-foreground">
                  <ArrowDown className="size-3 text-primary" aria-hidden />
                  {leg}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
